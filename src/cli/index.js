const { result }	= require("../util")
const { Cmds }		= require("./modes/cmd")
const BuiltIn		= require("../runtime/built_in")
const chalk			= require("chalk")
const { inspect }	= require("util")

const Modes = Object.freeze([
	{
		name: "bind",
		prompt: "="
	},
	{
		name: "query",
		prompt: "?"
	},
	{
		name: "cmd",
		prompt: "!"
	}
].reduce((a, c) => {
	a[c.name] = c
	Object.entries(c).forEach(([ k, v ]) => (a.where[k] ??= {})[v] = c)

	const { handle, complete } = require(`./modes/${c.name}`)
	c.handle = handle
	c.complete = complete

	Cmds[c.name] = Cmds[c.prompt] = {
		handle: loop => loop.io.i.prompt((loop.mode = c).prompt + "> ")
	}

	return a
}, { where: {} }))

module.exports = class Loop {
	global = {
		...BuiltIn,
		[ inspect.custom ] () {
			return chalk.cyan("[Loop.global]")
		}
	}
	config = {
		js_code: false,
		js_trace: false,

		d_tk: false,
		d_ast: false,
		d_ast_sc: false,
		d_sci: false,
		d_truth: [ "⊤", "⊥" ]
	}

	constructor() {
		this.time_strap = Date.now()
	}

	[ inspect.custom ] () {
		return chalk.cyan("[Loop: " + chalk.yellow("#" + this.time_strap) + "]")
	}

	async completer(ln, cb) {
		ln = ln.trimStart()

		cb(null, ln[0] === "!"
			? await Modes.cmd.complete(this, ln.slice(1))
			: await this.mode.complete?.(this, ln) ?? []
		)
	}

	async process(ln) {
		if (! (ln = ln.trim())) return

		ln[0] === "!"
			? await Modes.cmd.handle(this, ln.slice(1))
			: await this.mode.handle(this, ln)
	}

	async run({ io, inject_result }) {
		const that = this
		this.io = io

		if (inject_result) result.Result.prototype.log = function() {
			const v = this.catch()
			if (this.is_ok()) io.o.writeln(v)
			else io.e.writeln(that.config.js_trace
				? v
				: v.message
			)
		}

		Cmds.echo.handle(this, "Pow-Logic CLI, node.js edition.\n")
		Cmds.bind.handle(this)
		await Cmds.src.handle(this)

		while (true) {
			io.i.prompt()
			await this.process(await io.i.readln())
		}
	}
}
