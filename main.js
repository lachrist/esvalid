
var Visit = require("./visit.js")
var Build = require("./build.js")
var View = require("./view.js")

// Prepare
exports.Prepare = Visit

// Build //
exports.BuildStatement = Build.statements
exports.BuildExpression = Build.expressions
exports.BuildProgram = Build.Program
exports.BuildSwitchCase = Build.SwitchCase
exports.BuildDeclarator = Build.Declarator
exports.BuildInitProperty = Build.InitProperty
exports.BuildGetProperty = Build.GetProperty
exports.BuildSetProperty = Build.SetProperty

// Directive //
exports.Halt = function (node) { return (node.$halt=true, node) }
exports.Ignore = function (node) { return (node.$ignore=true, node) }

// View //
exports.View = View
