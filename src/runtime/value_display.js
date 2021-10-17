const chalk = require("chalk")

const _ser = (node, loop) => {
	switch (node.ty) {
	case "Arg":
		return chalk.magenta(node.name)
	case "Fun":
		return chalk.green(node.pat.length) + " patterns:\n"
			+ node.pat.map(p => "("
				+ p.param.map(({ ty, name }) =>
					chalk.yellow(ty) + ":" + chalk.magenta(name)
				).join(", ")
				+ ") "
				+ (typeof p.expr === "function"
					? (loop.config.js_code
						? p.expr
							.toString()
							.split2("=>")[1]
							.trim()
							.replace(/^\t{4}/gm, "")
							.replace(/\t/g, "   ")
						: chalk.cyan("<js code>")
					)
					: ser(p.expr, loop)
				)
			)
			.join("\n").replace(/^/gm, "   ")
	case "FunCal":
		return (node.callee.name ?? chalk.cyan("<f>"))
			+ "(" + node.arg.map(arg => ser(arg, loop, false)).join(", ") + ")"
	case "NumQ":
		return node.p + (node.q === 1 ? "" : "/" + node.q)
	case "Set":
		return "{ " + node.elem.map(node => ser(node, loop, false)).join(", ") + " }"
	case "Truth":
		return "⊤⊥"[ 1 - node.v ]
	case "Type":
		return chalk.yellow(node.id)
	}
}

const ser = (node, loop, d_ty = true) => (
	d_ty
		? chalk.yellow(
			node.ty === "Arg" ? node.arg_ty : node.ty
		) + " "
		: ""
	) + _ser(node, loop)

module.exports = ser
