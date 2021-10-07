const Mode = Object.freeze([
	{
		name: "bind",
		prompt: ">"
	},
	{
		name: "query",
		prompt: "?"
	}
].reduce((a, c) => {
	a[c.name] = c
	Object.entries(c).forEach(([ k, v ]) => (a.where[k] ??= {})[v] = c)
	c.logic = require(`./logic/${c.name}`)
	return a
}, { where: {} }))

module.exports = class Loop {
	constructor() {
		this.mode = Mode.bind
		this.global = {}
	}

	async run({ io: { i, o, e } }) {
		o.writeln("Pow-Logic CLI, node.js edition.\n")
		i.prompt("-> ")

		while (true) {
			i.prompt()

			const ln = await i.readln()

			if (ln[0] === "!") {
				const new_prompt = ln.slice(1)
				if (new_prompt in Mode.where.prompt) {
					this.mode = Mode.where.prompt[new_prompt]
					i.prompt("-" + new_prompt + " ")
				}
				else e.writeln("Unknown prompt.")
				continue
			}

			this.mode.logic(ln)
		}
	}
}
