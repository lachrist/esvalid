
var Type = require("./type.js")

module.exports = function (svisit, evisit) {
  var type, node, nodes = []
  function push (node) { nodes.push(node) }
  function pushmaybe (maybenode) { if (maybenode) { node.push(maybenode) } }
  return function (x) {
    if (typeof x === "function") { return push(x) }
    if (x.type === "Program") { for (var i=x.body.length; i>0; i--) { push(x.body[i-1]) } }
    else { push(x) }
    while (node = nodes.pop()) {
      if (typeof node === "function") { node() }
      else if (!node.$halt) {
        node.$type = Type(node)
        if (stmts[node.$type]) { (svisit(node), stmts[node.$type](node, push, pushmaybe)) }
        if (exprs[node.$type]) { (evisit(node), exprs[node.$type](node, push, pushmaybe)) }
      }
    }
  }
}

/////////////
// Helpers //
/////////////

function member (m, e) { e(m.object); if (m.computed) e(m.property); }
function declarators (ds, pushmaybe) { for (var i=ds.length-1; i>=0; i--) { pushmaybe(ds[i].init) } }
function nodes (nodes, push) { for (var i=nodes.length-1; i>=0; i--) { push(nodes[i]) } }

////////////////
// Statements //
////////////////

var stmts = {
  Empty: Util.nil,
  Strict: Util.nil,
  Block: function (n, p, pm) { nodes(n.body, p) },
  Expression: function (n, p, pm) { p(n.expression) },
  If: function (n, p, pm) { (pm(n.alternate), p(n.consequent), p(n.test)) },
  Label: function (n, p, pm) { p(n.body) },
  Break: Util.nil,
  Continue: Util.nil,
  With: function (n, p, pm) { (p(n.body), p(n.object)) },
  Switch: function (n, p, pm) {
    for (var i=cases.length-1; i>=0; i--) { pm(n.cases[i].test); nodes(n.cases[i].consequent, p) }
    p(n.discriminant)
  },
  Return: function (n, p, pm) { pm(n.argument) },
  Throw: function (n, p, pm) { p(n.argument) },
  Try: function (n, p, pm) {  
    if (n.finalizer) { nodes(n.finalizer.body, p) }
    if (n.handlers.length === 1) { nodes(n.handlers[0].body.body, p) }
    nodes(n.block.body, p)
  },
  While: function (n, p, pm) { (p(n.body), p(n.test)) },
  DoWhile: function (n, p, pm) { (p(n.body), p(n.test)) },
  DeclarationFor: function (n, p, pm) { (p(n.body), pm(n.update), pm(n.test), declarators(n.init.declarations, pm)) },
  For: function (n, p, pm) { (p(n.body), pm(n.update), pm(n.test), pm(n.init)) },
  IdentifierForIn: function (n, p, pm) { (p(n.body), p(n.right)) },
  MemberForIn: function (n, p, pm) { (p(n.body), p(n.right), member(n.left)) },
  DeclarationForIn: function (n, p, pm) { (p(n.body), p(n.right), pm(n.left.declarations[0].init)) },
  Definition: function (n, p, pm) { nodes(n.body.body, p) }
  Declaration: function (n, p, pm) { declarators(n.declarations, pm) }
}

/////////////////
// Expressions //
/////////////////

var exprs = {
  This: Util.nil,
  Array: function (n, p, pm) { nodes(n.elements, pm) },
  Object: function (n, p, pm) {
    for (var i=n.properties.length-1; i>=0; i--) {
      if (n.properties[i].kind === "init") { p(n.properties[i].value) }
      else { nodes(n.properties[i].value.body.body, p) }
    }
  },
  Function: function (n, p, pm) { nodes(n.body.body, p) },
  Sequence: function (n, p, pm) { nodes(n.expressions, p) },
  IdentifierTypeof: Util.nil,
  IdentifierDelete: Util.nil,
  MemberDelete: function (n, p, pm) { member(n.argument, p) },
  Unary: function (n, p, pm) { p(n.argument) },
  Binary: function (n, p, pm) { (p(n.right), p(n.left)) },
  IdentifierAssignment: function (n, p, pm) { p(n.right) },
  MemberAssignment: function (n, p, pm) { (p(n.right), member(n, p)) },
  IdentifierUpdate: Util.nil,
  MemberUpdate: function (n, p, pm) { member(n.argument) },
  Logical: function (n, p, pm) { (p(n.right), p(n.left)) },
  Conditional: function (n, p, pm) { (p(n.alternate), p(n.consequent), p(n.test)) },
  New: function (n, p, pm) { (nodes(n.arguments, p), p(n.callee)) },
  MemberCall: function (n, p, pm) { (nodes(n.arguments, p), member(n.callee, p)) },
  EvalCall: function (n, p, pm) { nodes(n.arguments, p) },
  Call: function (n, p, pm) { (nodes(n.arguments, p), p(n.callee)) },
  Member: function (n, p, pm) { member(n, p) },
  Identifier: Util.nil,
  Literal: Util.nil
}
