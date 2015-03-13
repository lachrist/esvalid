
var Visit = require("./visit.js")
var Extract = require("./extract.js")
var Build = require("./build.js")

exports.Visit = Visit
exports.ExtractExpression = Extract.expression
exports.ExtractStatement = Extract.statement
exports.BuildExpression = Build.expressions
exports.BuildStatement = Build.statements

exports.Halt = function (node) {
  node.$halt = true
  return node 
}

exports.Ignore = function (node) {
  node.$ignore = true
  return node
}