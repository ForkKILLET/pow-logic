const {
	result: { Ok, Result, catch_fun }
}					= require("../util")
const check_pargam	= require("../preproc/pargam_check")
const typeof_expr	= require("../preproc/expr_ty")
const chalk			= require("chalk")

const calc = (loop, node, up = null, stack = []) => {
	switch (node.ty) {
	case "FunCal":
		const pats = calc(loop, node.callee, up).try().pat
		const i = check_pargam(pats, node.arg)
		if (i < 0) throw "mismatched arguments."
		node.cache_pat = pats[i]
		let pat_ty = typeof_expr(pat.expr, true)

		const arg = node.arg.map(arg => calc(loop, arg, up, stack).try())
		if (typeof pat.expr === "function") {
			const ret = pat.expr(...arg)
			return ret instanceof Result ? ret : Ok(ret)
		}
		else {
			console.log(pat)
			return calc(loop, pat.expr, { ...node, arg }, [ ...stack, arg ])
		}

	case "Set":
		const elem = node.elem.map(elem => calc(loop, elem, up, stack).try())
		const eq = loop.global["="]
		elem.forEach((e, i) => {
			while (++ i < elem.length) {
				const t = elem[i]
				if (e.ty === t.ty) {
					const i = check_pargam(eq.pat, [ { ty: e.ty } ].repeat(2))
					if (i < 0) throw "difference of <Set> elements must be able to be judged by \"=\"."
					else if (calc(loop, {
						ty: "FunCal",
						callee: eq,
						arg: [ e, t ]
					}).try().v) throw "<Set> elements must be different."
				}
			}
		})
		return Ok({ ...node, elem })

	case "Ident":
		return Ok(node.cache_v ??= calc(loop, node.v).try())

	case "Arg":
		switch (up.ty) {
		case "FunCal":
			const pat = up.callee.cache_pat
			const [ arg, k ] = pat.scope.search_idx(node.name)
			if (k === stack.length - 1) return Ok(stack[k][arg.idx])
			return Ok(node)
		}

	default:
		return Ok(node)
	}
}

module.exports = catch_fun(calc, chalk.magenta)
