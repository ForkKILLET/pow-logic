const { result: { Ok, Err } }	= require("../util")
const Parser					= require("../preproc/parser")
const check_pargam				= require("../preproc/pargam_check")

const JsFun = (name, pat) => ({
	ty: "Fun",
	name,
	pat: pat.map(([ param, ret_ty, fun ]) => ({
		param: new Parser(null, param).Fun({ empty: true }).pat[0].param,
		ret_ty,
		expr: fun
	}))
})

const BuiltIn = {
	"Fun":		{ ty: "Type", id: "Fun" },
	"NumQ":		{ ty: "Type", id: "NumQ" },
	"Set":		{ ty: "Type", id: "Set" },
	"Truth":	{ ty: "Type", id: "Truth" },
	"Type":		{ ty: "Type", id: "Type" },
	"Any":		{ ty: "Type", id: "Any" },

	"true":		{ ty: "Truth", v: true },
	"false":	{ ty: "Truth", v: false },

	"+": JsFun("+", [
		[
			"(NumQ:l, NumQ:r)", "NumQ",
			(l, r) => {
				const g = Math.gcd(l.q, r.q)
				const p = (l.p * r.q + r.p * l.q) / g, q = Math.lcm(l.q, r.q, g)
				const g_ = Math.gcd(p, q)
				return { ty: "NumQ", p: p / g_, q: q / g_ }
			}
		],
		[
			"(Fun:l, Fun:r)", "Fun",
			(l, r) => {
				if (l.pat.some(({ param }, i) => check_pargam(r.pat, param, i) >= 0))
					return Err("can't overload <Fun>s which share a same pattern.")
				return Ok({
					ty: "Fun",
					pat:l.pat.concat(r.pat)
				})
			}
		]
	]),

	"-": JsFun("-", [
		[
			"(NumQ:x)", "NumQ",
			x => {
				return {
					ty: "NumQ",
					p: - x.p,
					q:x.q
				}
			}
		],
		[
			"(NumQ:l, NumQ:r)", "NumQ",
			(l, r) => {
				const g = Math.gcd(l.q, r.q)
				const p = (l.p * r.q - r.p * l.q) / g, q = Math.lcm(l.q, r.q, g)
				const g_ = Math.gcd(p, q)
				return { ty: "NumQ", p: p / g_, q: q / g_ }
			}
		]
	]),

	"*": JsFun("*", [
		[
			"(NumQ:l, NumQ:r)", "NumQ",
			(l, r) => {
				const p = l.p * r.p, q = l.q * r.q
				const g_ = Math.gcd(p, q)
				return { ty: "NumQ", p: p / g_, q: q / g_ }
			}
		]
	]),

	"*": JsFun("*", [
		[
			"(NumQ:l, NumQ:r)", "NumQ",
			(l, r) => {
				const p = l.p * r.q, q = l.q * r.p
				const g_ = Math.gcd(p, q)
				return { ty: "NumQ", p: p / g_, q: q / g_ }
			}
		]
	]),

	"=": JsFun("=", [
		[
			"(NumQ:l, NumQ:r)", "Truth",
			(l, r) => ({
				ty: "Truth",
				v: l.p === r.p && l.q === r.q
			})
		]
	]),

	"typeof": JsFun("typeof", [
		[
			"(Any:x)", "Type",
			x => ({
				ty: "Type",
				id:x.ty
			})
		]
	])
}

module.exports = BuiltIn
