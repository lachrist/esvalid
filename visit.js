
var Type = require("./type.js")

module.exports = function () {

  var type
  var node
  var workerlist = []
  var childs = []
  var child

  function push (node) { childs.push(node) }
  function pushmaybe (maybenode) { if (maybenode) { childs.push(maybenode) } }
  function insert (newnode, oldnode) {
    if (newnode) {
      var keys = Object.keys(newnode)
      var length = keys.length
      for (var i = 0; i<length; i++) { oldnode[keys[i]] = newnode[keys[i]] }
    }
  }

  function visit (ast, onstmt, onexpr) {
    for (var i=0; i<ast.body.length; i++) { workerlist.push(ast.body[i]) }
    while (node = workerlist.pop()) {
      if (typeof node === "function") { node() }
      else if (!node.$halt) {
        type = node.$type || (node.$type=Type(node))
        if (stmts[type]) {
          stmts[type](node, push, pushmaybe)
          if (!node.$ignore) { insert(onstmt(type, node), node) }
        } else if (exprs[type]) {
          exprs[type](node, push, pushmaybe)
          if (!node.$ignore) { insert(onexpr(type, node), node) }
        } else {
          throw new Error ("Unknown node type: "+type)
        }
        while (child = childs.pop()) { workerlist.push(child) }
      }
    }
  }

  return { visit:visit, mark:function (node) { workerlist.push(node) } }

}

/////////////
// Helpers //
/////////////

function nil () {}
function member (m, push) { if (push(m.object), m.computed) { push(m.property) } }
function declarators (ds, pushmaybe) { for (var i=0; i<ds.length; i++) { pushmaybe(ds[i].init) } }
function nodes (ns, push) { for (var i=0; i<ns.length; i++) { push(ns[i]) } }

////////////////
// Statements //
////////////////

var stmts = {
  Empty: nil,
  Strict: nil,
  Block: function (n, p, pm) { nodes(n.body, p) },
  Expression: function (n, p, pm) { p(n.expression) },
  If: function (n, p, pm) { (p(n.test), p(n.consequent), pm(n.alternate)) },
  Label: function (n, p, pm) { p(n.body) },
  Break: nil,
  Continue: nil,
  With: function (n, p, pm) { (p(n.object), p(n.body)) },
  Switch: function (n, p, pm) {
    p(n.discriminant)
    for (var i=0; i<n.cases.length; i++) { (pm(n.cases[i].test), nodes(n.cases[i].consequent, p)) }
  },
  Return: function (n, p, pm) { pm(n.argument) },
  Throw: function (n, p, pm) { p(n.argument) },
  Try: function (n, p, pm) {
    nodes(n.block.body, p)
    if (n.handlers.length === 1) { nodes(n.handlers[0].body.body, p) }
    if (n.finalizer) { nodes(n.finalizer.body, p) }    
  },
  While: function (n, p, pm) { (p(n.test), p(n.body)) },
  DoWhile: function (n, p, pm) { (p(n.body), p(n.test)) },
  DeclarationFor: function (n, p, pm) { (declarators(n.init.declarations, pm), pm(n.test), pm(n.update), p(n.body)) },
  For: function (n, p, pm) { (pm(n.init), pm(n.test), pm(n.update), p(n.body)) },
  IdentifierForIn: function (n, p, pm) { (p(n.right), p(n.body)) },
  MemberForIn: function (n, p, pm) { (member(n.left, p), p(n.right), p(n.body)) },
  DeclarationForIn: function (n, p, pm) { (pm(n.left.declarations[0].init), p(n.right), p(n.body)) },
  Definition: function (n, p, pm) { nodes(n.body.body, p) },
  Declaration: function (n, p, pm) { declarators(n.declarations, pm) }
}

/////////////////
// Expressions //
/////////////////

var exprs = {
  This: nil,
  Array: function (n, p, pm) { nodes(n.elements, pm) },
  Object: function (n, p, pm) {
    for (var i=0; i<n.properties.length; i++) {
      if (n.properties[i].kind === "init") { p(n.properties[i].value) }
      else { nodes(n.properties[i].value.body.body, p) }
    }
  },
  Function: function (n, p, pm) { nodes(n.body.body, p) },
  Sequence: function (n, p, pm) { nodes(n.expressions, p) },
  IdentifierTypeof: nil,
  IdentifierDelete: nil,
  MemberDelete: function (n, p, pm) { member(n.argument, p) },
  Unary: function (n, p, pm) { p(n.argument) },
  Binary: function (n, p, pm) { (p(n.left), p(n.right)) },
  IdentifierAssignment: function (n, p, pm) { p(n.right) },
  MemberAssignment: function (n, p, pm) { (member(n, p), p(n.right)) },
  IdentifierUpdate: nil,
  MemberUpdate: function (n, p, pm) { member(n.argument, p) },
  Logical: function (n, p, pm) { (p(n.left), p(n.right)) },
  Conditional: function (n, p, pm) { (p(n.test), p(n.consequent), p(n.alternate)) },
  New: function (n, p, pm) { (p(n.callee), nodes(n.arguments, p)) },
  MemberCall: function (n, p, pm) { (member(n.callee, p), nodes(n.arguments, p)) },
  EvalCall: function (n, p, pm) { nodes(n.arguments, p) },
  Call: function (n, p, pm) { (p(n.callee), nodes(n.arguments, p)) },
  Member: function (n, p, pm) { member(n, p) },
  Identifier: nil,
  Literal: nil
}
