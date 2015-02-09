
var Infos = require("./infos.js")
var Visit = require("./visit.js")

exports.Visit = Visit
exports.ExtractInformation = Infos.node
exports.ExtractExpressionInformation = Infos.expression
exports.ExtractStatementInformation = Infos.statement
