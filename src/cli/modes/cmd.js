const { readFile }	= require("fs/promises")
const chalk			= require("chalk")
const { more_fs }		= require("../../util")

const Cmds = {
	":": {
		handle: (loop, arg) => {
			loop.io.o.writeln(arg ?? "")
		}
	},
	"echo": ":",

	"%": {
		handle: (loop, arg) => {
			let [ n, v ] = arg.split2(" ").map(s => s.trim())
			const q = n.at(-1) === "?"
			if (! q) loop.config[n] = v ? JSON.parse(v) : ! loop.config[n]
			else n = n.slice(0, -1)
			loop.io.o.writeln("%s %s %O",
				n,
				chalk.cyan(q ? "->" : "<-"),
				loop.config[n]
			)
		},
		complete: (loop, arg) => {
			if (! arg.includes(" ")) return [
				Object.keys(loop.config).filter(k => k.startsWith(arg)),
				arg
			]
		}
	},
	"set": "%",

	"~": {
		handle: (loop, code) => {
			try {
				loop.io.o.writeln("%O", eval(code))
			}
			catch (err) {
				loop.io.e.writeln("%s", err)
			}
		},
		complete: null
	},
	"eval": "~",

	".": {
		handle: async (loop, file) => {
			try {
				const txt = await readFile(
					file ?? (process.env.HOME ?? process.env.USERPROFILE) + "/.plrc", { encoding: "utf8" }
				)
				txt.split("\n").forEach(ln => loop.process(ln))
			}
			catch (err) {
				if (file) loop.io.e.writeln(err.message)
			}
		},
		complete: async (_, arg) => [ await more_fs.complete_path(arg), arg ]
	},
	"src": "."
}
for (const k in Cmds)
	if (typeof Cmds[k] === "string")
		Cmds[k] = Cmds[Cmds[k]]

const handle = async (cmd, loop) => {
	const [ name, arg ] = cmd.split2(" ")
	if (name in Cmds) await Cmds[name].handle(loop, arg, name)
	else loop.io.e.writeln("unknown command.")
}

const complete = async (ln, loop) => {
	const [ name, arg ] = ln.split2(" ")
	return arg === undefined
		? [
			Object.keys(Cmds).filter(
				k => k.startsWith(name) && (! name || k.length > 1)
			),
			ln
		]
		: await Cmds[name].complete?.(loop, arg) ?? []
}

module.exports = { handle, complete, Cmds }
