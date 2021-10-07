#!/bin/env node

const lexer = require("../src/logic/lexer")

console.log(lexer(process.argv[2] + "\n"))
