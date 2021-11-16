const expand = (a, f) => Object.fromEntries(a.map(f))

module.exports = {
	...expand(
		[ ..."()[]{}," ],
		v => [
			v,
			{
				stt: {
					ty: v
				},
				end: true
			}
		]
	),
	...expand (
		[ "-", "+" ],
		v => [
			v,
			{
				if_not: {
					signed: true,
					ty: "ident"
				},
				then: {
					stt: {
						ty: "number",
						signed: true,
					},
					expect: {
						if_end: true,
						then: {
								stt: {
								ty: "ident",
							}
						}
					}
				}
			}
		]
	),
	":": {
		stt: {
			ty: "type"
		},
		end: true
	},
	".": {
		if: {
			ty: "number"
		},
		if_not: {
			demi: true,
			frac: true
		},
		then: {
			stt: {
				ty: "number",
				demi: true
			}
		}
	},
	"/": {
		if: {
			ty: "number"
		},
		if_not: {
			demi: true,
			frac: true
		},
		then: {
			stt: {
				ty: "number",
				frac: true
			}
		}
	},
	...expand(
		Array(10).fill(),
		(_, k) => [
			k.toString(),
			{
				if: {
					ty: "ident"
				},
				then: {
					stt: {
						ty: "ident"
					}
				},
				else: {
					stt: {
						ty: "number",
					}
				}
			}
		]
	),
	...expand(
		[ ..." \t\n\r" ],
		v => [
			v,
			{
				stt: {
					ty: "space"
				},
				ig: true
			}
		]
	),
	...expand(
		[ "⊤", "⊥" ],
		v => [
			v,
			{
				if: {
					ty: "ident"
				},
				then: {
					stt: {
						ty: "ident"
					}
				},
				else: {
					stt: {
						ty: "truth"
					}
				}
			}
		]
	),
	"&": {
		stt: {
			ty: "&"
		},
		expect: {
			if: {
				ty: "ref"
			},
			then: {
				stt: {
					ty: "ref"
				}
			}
		}
	},
	else: {
		if: {
			ty: "&"
		},
		then: {
			stt: {
				ty: "ref"
			}
		},
		else: {
			stt: {
				ty: "ident"
			},
			expect: {
				if: {
					ty: "type"
				},
				then: {
					stt: {
						ty: "type"
					}
				}
			}
		}
	}
}
