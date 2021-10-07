const lexer = require("./lexer")
const { result: { Err, Ok } } = require("../util")

module.exports = class Parser {
	#tks
	#pos = 0

	get #now() {
		return this.#tks[this.#pos]
	}

	#must(pred, err) {
		const now = this.#now
		if (! now) throw "unexpected end of input"
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

	test(eater) {
		const p = this.#pos
		try {
			const o = this[eater]()
			return Ok(o)
		}
		catch (e) {
			this.#pos = p
			return Err(e, { eater })
		}
	}

	test_all(msg, eaters) {
		const res = Err(msg)
		eaters.forEach(eater => res.or(this.test(eater)))
		return res
	}

	constructor(code) {
		this.#tks = lexer(code)
	}

	Demical() {
		const [ t, s ] = this.#must(t => t.ty === "number", "<Demical> must be a [number].")
		return {
			ty: "NumQ",
			...t.dotted
				? Math.parseFraction(...s.split("."))
				: { p: + s, q: 1 }
		}
	}

	Ident() {
		const [ s ] = this.#must(t => t.ty === "ident", "<Ident> must be [ident].")
		return {
			ty: "Ident",
			id: s
		}
	}

	Set() {
		const o = {
			ty: "Set",
			elem: []
		}
		this.#must(t => t.ty === "{", "<Set> not starts with [{].")
		while (true) {
			if (this.#may(t => t.ty === "}")) return o
			if (o.elem.length) this.#must(t => t.ty === ",", "<Set> element not separated by [,].")
			o.elem.push(this.Expr().try("<Set> element is not <Expr>."))
		}
		return o
	}

	Fun() {
		const o = {
			ty: "Fun",
			param: []
		}
		this.#must(t => t.ty === "(", "<Fun> not starts with [(].")
		while (true) {
			if (this.#may(t => t.ty === ")")) return o
			if (o.param.length) this.#must(t => t.ty === ",", "<Fun> parameter not separated by [,].")
			o.elem.push(this.test("Ident").try("<Fun> parameter is not <Ident>"))
		}
	}

	Expr() {
		return this.test_all("unexpected token", [ "Demical", "Set" ])
	}
}
