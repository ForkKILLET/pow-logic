const { stdio, ext } = require("./util")
ext.Math()

const loop = new (require("./cli"))
loop.run({ io: stdio() })
