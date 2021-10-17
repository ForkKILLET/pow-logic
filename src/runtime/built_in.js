const { result: { Ok, Err } } = require("../util")

const BuiltIn = {
	"Fun":		{ ty: "Type", id: "Fun" },
	"NumQ":		{ ty: "Type", id: "NumQ" },
	"Set":		{ ty: "Type", id: "Set" },
	"Truth":	{ ty: "Type", id: "Truth" },
	"Type":		{ ty: "Type", id: "Type" },

	"true":		{ ty: "Truth", v: true },
	"false":	{ ty: "Truth", v: false },

	"+": {
		ty: "Fun",
		name: "+",
		pat: [
			{
				param: [
					{ ty: "NumQ", name: "l" },
					{ ty: "NumQ", name: "r" }
				],
				ret_ty: "NumQ",
				expr: (l, r) => {
					const g = Math.gcd(l.q, r.q)
					const p = (l.p * r.q + r.p * l.q) / g, q = Math.lcm(l.q, r.q, g)
					const g_ = Math.gcd(p, q)
					return { ty: "NumQ", p: p / g_, q: q / g_ }
				}
			},
			{
				param: [
					{ ty: "Fun", name: "l" },
					{ ty: "Fun", name: "r" }
				],
				ret_ty: "Fun",
				expr: (l, r) => {
					if (l.pat.some(({ param }) => check_arg(r.pat, param)))
						return Err("can't overload <Fun>s which share a same pattern.")
					return Ok({
						ty: "Fun",
						pat: l.pat.concat(r.pat)
					})
				}
			}
		]
	},
	"-": {
		ty: "Fun",
		name: "-",
		pat: [
			{
				param: [
					{ ty: "NumQ", name: "x" }
				],
				ret_ty: "NumQ",
				expr: x => {
					x.p = - x.p
					return x
				}
			},
			{
				param: [
					{ ty: "NumQ", name: "l" },
					{ ty: "NumQ", name: "r" }
				],
				ret_ty: "NumQ",
				expr: (l, r) => {
					const g = Math.gcd(l.q, r.q)
					const p = (l.p * r.q - r.p * l.q) / g, q = Math.lcm(l.q, r.q, g)
					const g_ = Math.gcd(p, q)
					return { ty: "NumQ", p: p / g_, q: q / g_ }
				}
			}
		]
	},
	"*": {
		ty: "Fun",
		name: "*",
		pat: [
			{
				param: [
					{ ty: "NumQ", name: "l" },
					{ ty: "NumQ", name: "r" }
				],
				ret_ty: "NumQ",
				expr: (l, r) => {
					const p = l.p * r.p, q = l.q * r.q
					const g_ = Math.gcd(p, q)
					return { ty: "NumQ", p: p / g_, q: q / g_ }
				}
			}
		]
	},
	"/": {
		ty: "Fun",
		name: "/",
		pat: [
			{
				param: [
					{ ty: "NumQ", name: "l" },
					{ ty: "NumQ", name: "r" }
				],
				ret_ty: "NumQ",
				expr: (l, r) => {
					const p = l.p * r.q, q = l.q * r.p
					const g_ = Math.gcd(p, q)
					return { ty: "NumQ", p: p / g_, q: q / g_ }
				}
			}
		]
	},


	typeof: {
		ty: "Fun",
		name: "typeof",
		pat: [
			{
				param: [
					{ ty: "*", name: "x" }
				],
				ret_ty: "Type",
				expr: x => ({
					ty: "Type",
					id: x.ty
				})
			}
		]
	}
}
	
module.exports = BuiltIn
