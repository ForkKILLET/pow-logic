#!/bin/env -S node --trace-uncaught

const parser = require("../src/logic/parser")
const { ext } = require("../src/util")

ext.Math()
console.dir(
	new parser(process.argv[2] + "\n")/*.Demical()*/.Expr().try(),
	{ depth: Infinity }
)
