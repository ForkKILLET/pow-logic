const lexer			= require("./lexer")
const Scope			= require("./scope")
const { result: { Err, Ok, Assert } } = require("../util")

module.exports = class Parser {
	constructor(loop, code) {
		this.loop = loop ?? {
			config: {},
			global: {}
		}
		this.#tks = lexer(code + "\n")
		this.#scope = new Scope(this.loop)

		if (this.loop.config.d_tk) this.loop.io.o.writeln("Tokens: %o", this.#tks)
	}

	#tks
	#pos = 0
	#scope

	get #now() {
		return this.#tks[this.#pos]
	}

	#must(pred, err) {
		const now = this.#now
		if (! now) throw "unexpected end of input!"
		if (! pred(...now)) throw err
		this.#pos ++
		return now
	}

	#may(pred) {
		const now = this.#now
		if (now && pred(...now)) {
			this.#pos ++
			return now
		}
	}

	test(eater, ...args) {
		const p = this.#pos
		try {
			const o = this[eater](...args)
			return Ok(o)
		}
		catch (e) {
			this.#pos = p
			return Err(e, { eater })
		}
	}

	test_all(msg, eaters, ...args) {
		let err = Err(msg)
		for (const eater of eaters) {
			const res = this.test(eater, ...args)
			if (res.is_ok()) return res
			else if (! res.catch().message.endsWith("!")) err = res
		}
		return err
	}

	test_end(msg, eater, ...args) {
		return this.test(eater, ...args)
			.and(Assert(this.#pos === this.#tks.length, msg))
	}

	NumQ() {
		const [ t, s ] = this.#must(t => t.ty === "number", "<NumQ> must be a [number]!")
		let p, q
		if (t.demi) [ p, q ] = Math.parseFraction(...s.split("."))
		else if (t.frac) [ p, q ] = Math.simplifyFraction(...s.split("/").map(Number))
		else p = + s, q = 1
		return {
			ty: "NumQ",
			p, q
		}
	}

	Expr() {
		const ltd = !! this.#may(t => t.ty === "[")

		let expr = this.test_all("unexpected token", [
			"NumQ", "Fun", "Ident", "Set", "Truth"
		])

		if (expr.is_ok()) {
			const arg = expr.catch()
			while (true) {
				if (ltd && this.#may(t => t.ty === "]")) break
				const res = this.test_all("", [ "FunCal" ], arg)
				if (res.is_ok()) expr = res
				else {
					if (res.catch().message) return res
					else break
				}
			}
		}

		return expr
	}

	Fun({ empty } = {}) {
		const o = {
			ty: "Fun",
			pat: [
				{ param: [] }
			]
		}
		const p = o.pat[0]

		this.#must(t => t.ty === "(", "<Fun> must starts with [(]!")
		while (true) {
			if (this.#may(t => t.ty === ")")) break
			if (p.param.length) this.#must(t => t.ty === ",", "<Fun> parameters must be separated by [,].")

			p.param.push({
				ty: this.test("Type", { dead: empty }).try("<Fun> parameter must start with <Type>.").id,
				name: this.test("Ident", { dead: true }).try("<Fun> parameter must end with <Ident>.").id
			})
		}

		if (empty) return o

		p.expr = this.#scope.with(
			Object.fromEntries(
				p.param.map(({ name, ty }, idx) => [ name, { ty: "Arg", arg_ty: ty, name, idx } ])
			),
			() => {
				p.scope = this.#scope.copy()
				return this.Expr()
			}
		).try("unexpected token at <Fun> expr.")

		return o
	}

	FunCal(expr) {
		const o = {
			ty: "FunCal",
			callee: expr,
			arg: []
		}

		this.#must(t => t.ty === "(", "<FunCal> argument list must starts with [(]!")
		while (true) {
			if (this.#may(t => t.ty === ")")) break
			if (o.arg.length) this.#must(t => t.ty === ",", "<FunCal> arguments must be separated by [,].")
			o.arg.push(this.Expr().try("unexpected token at <FunCal> argument."))
		}

		return o
	}

	Ident({ dead } = {}) {
		const [, s ] = this.#must(t => t.ty === "ident", "<Ident> must be [ident]!")
		const v = this.#scope.search(s) ?? (() => {
			if (! dead) throw `unbound <Ident> ${s}.`
		})()
		return dead ? {
			ty: "Ident",
			id: s,
			v
		} : v
	}

	Set() {
		const o = {
			ty: "Set",
			elem: []
		}

		this.#must(t => t.ty === "{", "<Set> must start with [{]!", true)
		while (true) {
			if (this.#may(t => t.ty === "}")) return o
			if (o.elem.length) this.#must(t => t.ty === ",", "<Set> elements must be separated by [,].")
			o.elem.push(this.Expr().try("unexpected token at <Set> element"))
		}
	}

	Truth() {
		const [ , s ] = this.#must(t => t.ty === "truth", "<Truth> must be [truth]!")
		return {
			ty: "Truth",
			v: s === "⊤"
		}
	}

	Type({ dead } = {}) {
		const [ , s ] = this.#must(t => t.ty === "type", "<Type> must be [type]!")
		const id = s.slice(0, -1)
		if (! dead && this.#scope.search(id)?.ty !== "Type") throw `unbound <Type> ${s}.`
		return {
			ty: "Type",
			id
		}
	}
}
