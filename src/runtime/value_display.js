const chalk = require("chalk")

const raw_ser = (loop, node) => {
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
							.replace(/^\t{3}/gm, "")
							.replace(/\t/g, "   ")
						: chalk.cyan("<js code>")
					)
					: ser(loop, p.expr)
				)
			)
			.join("\n").replace(/^/gm, "   ")
	case "FunCal":
		return (node.callee.name ?? chalk.cyan("<f>"))
			+ "(" + node.arg.map(arg => ser(loop, arg, false)).join(", ") + ")"

	case "NumQ":
		return node.p + (node.q === 1 ? "" : "/" + node.q)
	case "Set":
		return "{ " + node.elem.map(node => ser(loop, node, false)).join(", ") + " }"
	case "Truth":
		return loop.config.d_truth[ 1 - node.v ]
	case "Type":
		return chalk.yellow(node.id)
	}
}

const ser = (loop, node, d_ty = true) => (
	d_ty
		? chalk.yellow(
			node.ty === "Arg" ? node.arg_ty : node.ty
		) + " "
		: ""
	) + raw_ser(loop, node)

module.exports = ser
