const rl = require("readline")
const util = require("util")

const stdio = () => {
	const rli = rl.createInterface({
		input: process.stdin,
		output: process.stdout,
		tabSize: 4
	})

	const lns = [], cs = []

	rli.on("line", ln => {
		if (cs.length) cs.pop()(ln)
		else lns.unshift(ln)
	})

	const writef = write => (...arg) => write(util.format(...arg))

	return {
		i: {
			readln: () => new Promise(res => {
				if (lns.length) res(lns.pop())
				else cs.unshift(res)
			}),

			prompt: prompt => {
				if (prompt) rli.setPrompt(prompt)
				else rli.prompt()
			}
		},

		o: {
			write: writef(s => process.stdout.write(s)),
			writeln: writef(s => process.stdout.write(s + "\n"))
		},

		e: {
			write: writef(s => process.stderr.write(s)),
			writeln: writef(s => process.stderr.write(s + "\n"))
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
			return { p, q }
		},

		gcd: (x, y) => y ? Math.gcd(y, x % y) : x
	})
}

const result = {
	Result: class {
		static Error = class extends Error {
			constructor(msg, data) {
				super(msg)
				Object.assign(this, data)
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
				this.#v = r.try()
			}
		}
	},
	Err: (msg, data) => new result.Result(false, new result.Result.Error(msg, data)),
	Ok: (v) => new result.Result(true, v)
}

module.exports = {
	stdio, ext, result
}
