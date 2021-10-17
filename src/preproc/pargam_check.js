module.exports = (pat, arg) => pat.findIndex(({ param }) =>
	param.length === arg.length &&
	param.every(({ ty }, k) =>
		ty === "*" ||
		ty === arg[k].ty ||
		arg[k].ty === "FunCal" && ty === arg[k].pat_ty ||
		arg[k].ty === "Arg" && ty === arg[k].arg_ty
	)
)
