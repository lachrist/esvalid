
module.exports = function (svisit, evisit) {
  var n
  var buffer = []
  var nodes = []
  function e (n) { n.expr = true ; buffer.push(n) }
  function s (n) { n.stmt = true ; buffer.push(n) }
  return function (x) {
    if (typeof x === "function") { return nodes.push(x) }
    if (x.type === "Program") { for (var i=0; i<x.body.length; i++) { s(x.body[i]) } }
    if (stmts[x.type]) { s(x) }
    if (exprs[x.type]) { e(x) }
    while (n = buffer.pop()) { nodes.push(n) }
    while (n = nodes.pop()) {
      if (typeof n === "function") { n() }
      if (n.stmt) { svisit(stmts[n.type](n, s, e), n) }
      if (n.expr) { evisit(exprs[n.type](n, s, e), n) }
      while (n = buffer.pop()) { nodes.push(n) }
    }
  }
}

/////////////
// Helpers //
/////////////

function left (l, e) {
  if (l.type === "Identifier") { return "Identifier" }
  if (l.type === "MemberExpression") {
    member(l, e)
    return "Member"
  }
  throw new Error("Unexpected left-hand side: "+l.type)
}

function member (m, e) {
  e(m.object)
  if (m.computed) { e(m.property) }
}

function declarations (ds, e) {
  for (var i=0; i<ds.length; i++) {
    if (ds[i].init) { e(ds[i].init) }
  }
}

function block (b, s) {
  for (var i=0; i<b.body.length; i++) { s(b.body[i]) }
}

////////////////
// Statements //
////////////////

var stmts = {}

stmts.EmptyStatement = function (n, s, e) {
  return "Empty"
}

stmts.BlockStatement = function (n, s, e) {
  block(n, s)
  return "Block"
}

stmts.ExpressionStatement = function (n, s, e) {
  e(n.expression)
  return "Expression"
}

stmts.IfStatement = function (n, s, e) {
  e(n.test)
  s(n.consequent)
  if (n.alternate) { s(n.alternate) }
  return "If"
}

stmts.LabeledStatement = function (n, s, e) {
  s(n.body)
  return "Labeled"
}

stmts.BreakStatement = function (n, s, e) {
  return "Break"
}

stmts.ContinueStatement = function (n, s, e) {
  return "Continue"
}

stmts.WithStatement = function (n, s, e) {
  e(n.object)
  s(n.body)
  return "With"
}

stmts.SwitchStatement = function (n, s, e) {
  e(n.descriminant)
  for (var i=0; i<n.cases.length; i++) {
    var c = n.cases[i]
    if (c.test) { e(c.test) }
    for (var j=0; j<c.consequent.length; j++) { s(c.consequent[j]) }
  }
  return "Switch"
}

stmts.ReturnStatement = function (n, s, e) {
  if (n.argument) { e(n.argument) }
  return "Return"
}

stmts.ThrowStatement = function (n, s, e) {
  e(n.argument)
  return "Throw"
}

stmts.TryStatement = function (n, s, e) {
  block(n.block, s)
  if (n.handler) { block(n.handler.body, s) }
  if (n.finalizer) { block(n.finalizer, s) }
  return "Try"
}

stmts.WhileStatement = function (n, s, e) {
  e(n.test)
  s(n.body)
  return "While"
}

stmts.DoWhileStatement = function (n, s, e) {
  e(n.test)
  s(n.body)
  return "DoWhile"
}

stmts.ForStatement = function (n, s, e) {
  if (n.init) {
    if (n.init.type !== "VariableDeclaration") {
      var type = "DeclarationFor"
      e(n.init)
    }
    else {
      var type = "For"
      declarations(n.init.declarations, e)
    }
  } else {
    var type = "For"
  }
  if (n.test) { e(n.test) }
  if (n.update) { e(n.update) }
  s(n.body)
  return type
}

stmts.ForInStatement = function (n, s, e) {
  if (n.left.type === "VariableDeclaration") {
    var type = "DeclarationForIn"
    if (n.left.declarations.length != 1) { throw new Error("Illegal number of declarations within a for-in statement") }
    if (n.left.declarations[0].init) { e(n.left.declarations[0].init) }
  } else {
    var type = left(n.left, e)+"ForIn" 
  }
  e(n.right)
  s(n.body)
  return type
}

stmts.FunctionDeclaration = function (n, s, e) {
  block(n.body, s)
  return "Definition"
}

stmts.VariableDeclaration = function (n, s, e) {
  declarations(n.declarations, e)
  return "Declaration"
}

/////////////////
// Expressions //
/////////////////

var exprs = {}

exprs.ThisExpression = function (n, s, e) {
  return "This"
}

exprs.ArrayExpression = function (n, s, e) {
  for (var i=0; i<n.elements.length; i++) {
    if (n.elements[i]) { e(n.elements[i]) }
  }
  return "Array"
}

exprs.ObjectExpression = function (n, s, e) {
  for (var i=0; i<n.properties.length; i++) {
    if (n.properties[i].kind === "init") { e(n.properties[i].value) }
    else { block(n.properties[i].value.body, s) }
  }
  return "Object"
}

exprs.FunctionExpression = function (n, s, e) {
  block(n.body, s)
  return "Function"
}

exprs.SequenceExpression = function (n, s, e) {
  for (var i=0; i<n.expressions.length; i++) { e(n.expressions[i]) }
  return "Sequence"
}

exprs.UnaryExpression = function (n, s, e) {
  if (n.operator === "typeof" && n.argument.type === "Identifier") { return "IdentifierTypeof" }
  if (n.operator === "delete") { try { return left(n.argument, e)+"Delete" } catch (error) {} }
  e(n.argument)
  return "Unary"
}

exprs.BinaryExpression = function (n, s, e) {
  e(n.left)
  e(n.right)
  return "Binary"
}

exprs.AssignmentExpression = function (n, s, e) {
  e(n.right)
  return left(n.left, e)+"Assignment"
}

exprs.UpdateExpression = function (n, s, e) {
  return left(n.argument, e)+"Update"
}

exprs.LogicalExpression = function (n, s, e) {
  e(n.left)
  e(n.right)
  return "Logical"
}

exprs.ConditionalExpression = function (n, s, e) {
  e(n.test)
  e(n.alternate)
  e(n.consequent)
  return "Conditional"
}

exprs.NewExpression = function (n, s, e) {
  e(n.callee)
  for (var i=0; i<n.arguments.length; i++) { e(n.arguments[i]) }
  return "New"
}

exprs.CallExpression = function (n, s, e) {
  if (n.callee.name === "eval") { var type = "EvalCall" }
  else if (n.callee.type === "MemberExpression") { var type = (member(n.callee, e), "MemberCall") }
  else { var type = (e(n.callee), "Call") }
  for (var i=0; i<n.arguments.length; i++) { e(n.arguments[i]) }
  return type
}

exprs.MemberExpression = function (n, s, e) {
  member(n, e)
  return "Member"
}

exprs.Identifier = function (n, s, e) {
  return "Identifier"
}

exprs.Literal = function (n, s, e) {
  return "Literal"
}
