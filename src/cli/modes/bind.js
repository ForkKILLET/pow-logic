const Parser = require("../../preproc/parser")

const handle= (loop, cmd) => {
	let [ ident, code ] = cmd.split2("=")

	ident = new Parser(loop, ident).test_end("unexcepted structure after <Ident> to bind", "Ident", { dead: true })
	if (ident.is_err()) return ident.log()
	ident = ident.catch()

	if (! code) return loop.io.e.writeln("<Ident> to bind must be followed by \"=\".")

	code = new Parser(loop, code).Expr()
	if (code.is_err()) return code.log()
	code = code.catch()

	if (code.ty === "Fun") code.name ??= ident.id

	if (loop.global[ident.id]) {
		if (ident.id[0] !== "$") return loop.io.e.writeln("rebound of var")
	}

	loop.global[ident.id] = code
}

module.exports = { handle }
