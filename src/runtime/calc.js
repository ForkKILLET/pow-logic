const { result: { Ok, Result } } = require("../util")

const calc = (node, copy = false, up = null, stack = []) => {
	switch (node.ty) {
	case "FunCal":
		const pat = node.callee.pat[node.pat_idx]
		const arg = node.arg.map(arg => calc(arg, true, up, stack).try())
		if (typeof pat.expr === "function") {
			const ret = pat.expr(...arg)
			return ret instanceof Result ? ret : Ok(ret)
		}
		else return calc(pat.expr, true, { ...node, arg }, [ ...stack, arg ])
	default:
		if (copy) switch (node.ty) {
		case "NumQ":
		case "Truth":
			return Ok({ ...node })
		case "Set":
			return Ok({
				...node,
				elem: node.elem.map(elem => calc(elem, true, up, stack).try())
			})
		case "Arg":
			switch (up.ty) {
			case "FunCal":
				const pat = up.callee.pat[up.pat_idx]
				const [ arg, k ] = pat.scope.search_idx(node.name)
				if (k === stack.length - 1) return Ok(stack[k][arg.idx])
				return Ok(node)
			}
		}
		return Ok(node)
	}
}

module.exports = calc
