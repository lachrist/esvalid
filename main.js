
var Visit = require("./visit.js")
var Extract = require("./extract.js")
var Build = require("./build.js")

var singleton = Visit()

exports.Prepare = Visit
exports.Visit = singleton.visit
exports.Mark = singleton.mark

exports.ExtractExpression = Extract.expression
exports.ExtractStatement = Extract.statement

exports.BuildStatement = Build.statements
exports.BuildExpression = Build.expressions
exports.BuildProgram = Build.Program
exports.BuildSwitchCase = Build.SwitchCase
exports.BuildDeclarator = Build.Declarator
exports.BuildInitProperty = Build.InitProperty
exports.BuildGetProperty = Build.GetProperty
exports.BuildSetProperty = Build.SetProperty

exports.BE = Build.expressions
exports.BS = Build.statements

exports.Halt = function (node) {
  node.$halt = true
  return node 
}

exports.Ignore = function (node) {
  node.$ignore = true
  return node
}
