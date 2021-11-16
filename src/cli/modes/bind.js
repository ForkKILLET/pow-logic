const Parser = require("../../preproc/parser")

const handle= (loop, cmd) => {
	let [ ident, code ] = cmd.split2("=")

	ident = new Parser(loop, ident).test_end("unexcepted tokens after <Ident> to bind", "Ident", { dead: true })
	if (ident.is_err()) return ident.log()
	ident = ident.catch()

	if (! code) return loop.io.e.writeln("<Ident> to bind must be followed by \"=\".")

	code = new Parser(loop, code).Expr()
	if (code.is_err()) return code.log()
	const expr = code.catch()

	if (expr.ty === "Fun") expr.name ??= ident.id

	if (loop.global[ident.id]) {
		return loop.io.e.writeln("rebound of var")
	}

	loop.global[ident.id] = ident
	ident.v = expr
}

module.exports = { handle }
