const chalk = require("chalk")
const { inspect } = require("util")

module.exports = class Scope extends Array {
	constructor(loop) {
		super()
		this.loop = loop
		this[0] = loop.global
	}

	[ inspect.custom ] () {
		return chalk.cyan(`[Scope(${ this.length })]`)
	}

	search(name) {
		for (const tier of this)
			if (tier[name]) return tier[name]
	}

	search_idx(name) {
		for (const [ k, tier ] of this.entries())
			if (tier[name]) return [ tier[name], k ]
		return [ -1 ]
	}

	with(tier, fn) {
		this.unshift(tier)
		if (this.loop.config.d_sci)
			this.loop.io.o.writeln("Scope insert %d#: %o", this.length - 1, tier)
		const res = fn()
		this.shift()
		return res
	}

	copy() {
		const that = new Scope(this.loop)
		that.unshift(...this.slice(0, -1))
		return that
	}
}
