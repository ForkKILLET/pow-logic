module.exports = (pat, arg, i) => pat.findIndex(({ param }, j) =>
	i !== j &&
	param.length === arg.length &&
	param.every(({ ty }, k) =>
		ty === "Any" ||
		ty === arg[k].ty ||
		arg[k].ty === "FunCal" && ty === arg[k].pat_ty ||
		arg[k].ty === "Arg" && ty === arg[k].arg_ty
	)
)
