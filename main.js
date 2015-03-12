
var Infos = require("./infos.js")
var Visit = require("./visit.js")
var Type = require("./type.js")

exports.Prepare = Visit
exports.ExtractInformation = Infos.node
exports.ExtractExpressionInformation = Infos.expression
exports.ExtractStatementInformation = Infos.statement
exports.ConstructExpression = Builder.expression
exports.ConstructStatement = Builder.statement