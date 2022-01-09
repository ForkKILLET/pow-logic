const ty = (expr) => {
	switch (expr.ty) {
	case "FunCal":
		if (! do_pat) return expr.pat_ty
		const pat = expr.callee.pat[expr.pat_idx]
		return pat.ret_ty ?? ty(pat.expr)
	case "Ident": return ty(expr.cache_v ?? expr.v)
	case "Arg": return expr.arg_ty
	default: return expr.ty
	}
}
module.exports = ty
