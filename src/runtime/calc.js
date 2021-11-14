const {
	result: { Ok, Result, catch_fun }
}					= require("../util")
const check_pargam	= require("../preproc/pargam_check")
const chalk			= require("chalk")

const calc = (loop, node, up = null, stack = []) => {
	switch (node.ty) {
	case "FunCal":
		const pat = calc(loop, node.callee, up).try().pat[node.pat_idx]
		const arg = node.arg.map(arg => calc(loop, arg, up, stack).try())
		if (typeof pat.expr === "function") {
			const ret = pat.expr(...arg)
			return ret instanceof Result ? ret : Ok(ret)
		}
		else return calc(loop, pat.expr, { ...node, arg }, [ ...stack, arg ])

	case "Set":
		const elem = node.elem.map(elem => calc(loop, elem, up, stack).try())
		const eq = loop.global["="]
		elem.forEach((e, i) => {
			while (++ i < elem.length) {
				const t = elem[i]
				if (e.ty === t.ty) {
					const pat_idx = check_pargam(eq.pat, [ { ty: e.ty } ].repeat(2))
					if (pat_idx === -1) throw "difference of <Set> elements must be able to be judged by \"=\"."
					else if (calc(loop, {
						ty: "FunCal",
						callee: eq,
						pat_idx,
						arg: [ e, t ]
					}).try().v) throw "<Set> elements must be different."
				}
			}
		})
		return Ok({ ...node, elem })

	case "Arg":
		switch (up.ty) {
		case "FunCal":
			const pat = up.callee.pat[up.pat_idx]
			const [ arg, k ] = pat.scope.search_idx(node.name)
			if (k === stack.length - 1) return Ok(stack[k][arg.idx])
			return Ok(node)
		}

	default:
		return Ok(node)
	}
}

module.exports = catch_fun(calc, chalk.magenta)
