const Parser		= require("../../preproc/parser")
const calc			= require("../../runtime/calc")
const display_value	= require("../../runtime/value_display")

const handle = (cmd, loop) => {
	let expr = new Parser(loop, cmd).Expr()
	if (expr.is_err()) return expr.log()
	expr = expr.catch()
	if (loop.config.d_ast) loop.io.o.writeln("AST: %O", expr)

	const res = calc(expr, loop)
	if (res.is_ok())
		loop.io.o.writeln(display_value(res.catch(), loop))
	else
		res.log()
}

module.exports = { handle }
