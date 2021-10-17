const { stdio, ext } = require("./util")
for (const n in ext) ext[n]()

const loop = new (require("./cli"))
loop.run({ io: stdio(loop), inject_result: true })
