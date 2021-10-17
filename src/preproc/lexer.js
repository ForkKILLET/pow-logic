const TokenPatterns = require("./token_pattern")

module.exports = code => {
	const tks = []
	let stt, tk = ""

	const test = (pat, stt, dft) => {
		pat ??= dft

		if (pat?.if || pat?.if_not || pat?.if_end) {
			return test((
				(
					pat.if_end === undefined ||
					dif
				) && (
					! pat.if ||
					Object.entries(pat.if).every(([ k, v ]) => stt?.[k] === v)
				) && (
					! pat.if_not ||
					Object.entries(pat.if_not).every(([ k, v ]) => stt?.[k] !== v)
				)
			) ? pat.then : pat.else)
		}

		else return pat
	}

	const end = pat => {
		if (! pat?.ig) tks.push([ stt, tk ])
		tk = ""
		stt = undefined
	}

	let lst_pat, dif

	for (const c of [ ...code ]) {
		const pat = test(TokenPatterns[c], stt, TokenPatterns.else)

		dif = stt && stt.ty !== pat.stt.ty

		if (lst_pat?.expect) {
			const mod = test(lst_pat.expect, pat.stt)
			if (mod) {
				stt = { ...stt, ...mod.stt }
				dif = stt.ty !== pat.stt.ty
			}
		}

		if (dif && stt) end(lst_pat)
		tk += c
		stt = { ...stt, ...pat.stt }

		if (pat.end) end(pat)

		lst_pat = pat
	}

	return tks
}

