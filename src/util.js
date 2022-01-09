const chalk	= require("chalk")
const rl	= require("readline")
const util	= require("util")
const path	= require("path")
const fs	= require("fs/promises")

const stdio = (loop) => {
	const rli = rl.createInterface({
		input: process.stdin,
		output: process.stdout,
		tabSize: 4,
		completer: loop.completer.bind(loop)
	})

	const lns = [], cs = []

	rli.on("line", ln => {
		if (cs.length) cs.pop()(ln)
		else lns.unshift(ln)
	})

	const optf = {
		colors: true,
		depth: Infinity
	}
	const writef = write => (...arg) => write(util.formatWithOptions(optf, ...arg))

	return {
		i: {
			readln: () => new Promise(res => {
				if (lns.length) res(lns.pop())
				else cs.unshift(res)
			}),

			prompt: prompt => {
				if (prompt) rli.setPrompt(chalk.cyan(prompt))
				else rli.prompt()
			}
		},

		o: {
			write: writef(s => process.stdout.write(s)),
			writeln: writef(s => process.stdout.write(s + "\n"))
		},

		e: {
			write: writef(s => process.stderr.write(chalk.red(s))),
			writeln: writef(s => process.stderr.write(chalk.red(s) + "\n"))
		}
	}
}

const ext = {
	Math: () => Object.assign(Math, {
		parseFraction: (i, d) => {
			let p = + d, q2, q5
			q2 = q5 = d.length
			for (; ! (p % 2); p /= 2) q2 --
			for (; ! (p % 5); p /= 5) q5 --
			const q = 2 ** q2 * 5 ** q5
			if (i[0] === "-") p = - p
			p += i * q
			return [ p, q ]
		},
		simplifyFraction: (p, q) => {
			const g = Math.gcd(p, q)
			return [ p / g, q / g ]
		},
		gcd: (x, y) => y ? Math.gcd(y, x % y) : x,
		lcm: (x, y, g) => x * y / (g ?? Math.gcd(x, y))
	}),

	String: () => Object.assign(String.prototype, {
		split2(s) {
			const i = this.indexOf(s)
			return i < 0 ? [ this ] : [ this.slice(0, i), this.slice(i + s.length) ]
		}
	}),

	Array: () => Object.assign(Array.prototype, {
		repeat(n) {
			let ret = []
			while (n --) ret = ret.concat(this)
			return ret
		}
	})
}

const result = {
	Result: class {
		static Error = class extends Error {
			constructor(msg, data) {
				super(msg)
				Object.assign(this, data)
			}

			[ util.inspect.custom ] () {
				const s = this.original_stack
				delete this.original_stack
				let e = util.inspect(this, { customInspect: false })
				if (s) {
					e += chalk.yellow([ "", "Original Error:", ...s.split("\n").slice(1) ].join("\n"))
					this.original_stack = s
				}
				return e
			}
		}

		#t; #v
		constructor(t, v) {
			this.#t = !! t
			this.#v = v
		}

		is_ok() { return this.#t }
		is_err() { return ! this.#t }

		try(e) {
			if (this.#t) return this.#v
			throw e ?? this.#v
		}
		catch() {
			return this.#v
		}

		ok() {
			if (this.#t) return this.#v
			return
		}
		err() {
			if (this.#t) return
			return this.#v
		}

		or(r) {
			if (! this.#t && r.is_ok()) {
				this.#t = true
				this.#v = r.catch()
			}
			return this
		}
		and(r) {
			if (this.#t && r.is_err()) {
				this.#t = false
				this.#v = r.catch()
			}
			return this
		}
	},
	Err: (msg, data) =>
		new result.Result(false, new result.Result.Error(msg, data)),
	Ok: (v) =>
		new result.Result(true, v),
	Assert: (t, msg) =>
		new result.Result(t, t ? null : msg),

	catch_fun: (f, map) => (...a) => {
		try {
			return f(...a)
		}
		catch (err) {
			return result.Err(typeof map === "function" ? map(err) : err, {
				original_stack: err.stack
			})
		}
	}
}

const assert = {
	_: {
		ty: (n, p) => n.ty === p,
		match: (n, p) => {
			if (p && typeof p === "object") {
				for (const k in p) if (! assert._.match(n?.[k], p[k])) return false
				return true
			}
			return n === p
		}
	},
	wrapper: node => new Proxy(assert._, {
		get: (_, k) => (...a) => _[k](node, ...a) ? assert.wrapper(node) : false
	})
}


const more_fs = {
	complete_path: async ln => {
		if (ln === ".") ln = "./"
		else if (ln === "..") ln = "../"

		let abs_path
		if (ln[0] !== "/") {
			if (! /^\.{1,2}\//.test(ln)) ln = "./" + ln
			abs_path = path.resolve(ln + "#").slice(0, -1)
		}
		else abs_path = ln

		const [, abs_dir, nxt ] = abs_path.match(/(.*\/)(.*)/)
		const [, rel_dir ] = ln.match(/(.*\/)/)
		const children = await fs.readdir(abs_dir, { withFileTypes: true }).catch(() => [])

		const completions = children
			.filter(child => child.name.startsWith(nxt))
			.map(child => rel_dir + child.name)
		return [ completions, ln ]
	}
}

module.exports = {
	stdio, ext, result, assert, more_fs
}
