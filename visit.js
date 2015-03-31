
var Type = require("./type.js")

module.exports = function () {

  var workerlist = []
  var childs = []

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
    var type, node, child
    for (var i=0; i<ast.body.length; i++) { workerlist.push(ast.body[i]) }
    while (node = workerlist.pop()) {
      if (typeof node === "function") { node() }
      else if (!node.$halt) {
        type = node.$type || (node.$type=Type(node))
        if (stmts[type]) {
          stmts[type](node)
          if (!node.$ignore) { insert(onstmt(type, node), node) }
        } else if (exprs[type]) {
          exprs[type](node)
          if (!node.$ignore) { insert(onexpr(type, node), node) }
        } else {
          throw new Error ("Unknown node type: "+type)
        }
        while (child = childs.pop()) { workerlist.push(child) }
      }
    }
  }

  /////////////
  // Helpers //
  /////////////

  function nil () {}
  function member (m) {
    childs.push(m.object)
    if (m.computed) { childs.push(m.property) }
  }


  function declarators (ds) {
    for (var i=0; i<ds.length; i++) {
      if (ds[i].init) { childs.push(ds[i].init) }
    }
  }


  function nodes (ns) { for (var i=0; i<ns.length; i++) { childs.push(ns[i]) } }

  ////////////////
  // Statements //
  ////////////////

  var stmts = {
    Empty: nil,
    Strict: nil,
    Block: function (n) { nodes(n.body) },
    Expression: function (n) { childs.push(n.expression) },
    If: function (n) {
      childs.push(n.test)
      childs.push(n.consequent)
      if (n.alternate) { childs.push(n.alternate) }
    },
    Label: function (n) { childs.push(n.body) },
    Break: nil,
    Continue: nil,
    With: function (n) {
      childs.push(n.object)
      childs.push(n.body)
    },
    Switch: function (n) {
      childs.push(n.discriminant)
      for (var i=0; i<n.cases.length; i++) {
        if (n.cases[i].test) { childs.push(n.cases[i].test) }
        nodes(n.cases[i].consequent)
      }
    },
    Return: function (n) { if (n.argument) { childs.push(n.argument) } },
    Throw: function (n) { childs.push(n.argument) },
    Try: function (n) {
      nodes(n.block.body)
      if (n.handlers.length === 1) { nodes(n.handlers[0].body.body) }
      if (n.finalizer) { nodes(n.finalizer.body) }    
    },
    While: function (n) {
      childs.push(n.test)
      childs.push(n.body)
    },
    DoWhile: function (n) {
      childs.push(n.body)
      childs.push(n.test)
    },
    DeclarationFor: function (n) {
      declarators(n.init.declarations)
      if (n.test) { childs.push(n.test) }
      if (n.update) { childs.push(n.update) }
      childs.push(n.body)
    },
    For: function (n) {
      if (n.init) { childs.push(n.init) }
      if (n.test) { childs.push(n.test) }
      if (n.update) { childs.push(n.update) }
      childs.push(n.body)
    },
    IdentifierForIn: function (n) {
      childs.push(n.right)
      childs.push(n.body)
    },
    MemberForIn: function (n) {
      member(n.left),
      childs.push(n.right)
      childs.push(n.body)
    },
    DeclarationForIn: function (n) {
      if (n.left.declarations[0].init) { childs.push(n.left.declarations[0].init) }
      childs.push(n.right)
      childs.push(n.body)
    },
    Definition: function (n) { nodes(n.body.body) },
    Declaration: function (n) { declarators(n.declarations) }
  }

  /////////////////
  // Expressions //
  /////////////////

  var exprs = {
    This: nil,
    Array: function (n) { nodes(n.elements) },
    DataObject: function (n) { for (var i=0; i<n.properties.length; i++) { childs.push(n.properties[i].value) } },
    AccessorObject: function (n) {
      for (var i=0; i<n.properties.length; i++) {
        if (n.properties[i].kind === "init") { childs.push(n.properties[i].value) }
        else { nodes(n.properties[i].value.body.body) }
      }
    },
    Function: function (n) { nodes(n.body.body) },
    HoistedFunction: function (n) { for (var i=1; i<n.body.body.length; i++) { childs.push(n.body.body[i]) } },
    Sequence: function (n) { nodes(n.expressions) },
    IdentifierTypeof: nil,
    IdentifierDelete: nil,
    MemberDelete: function (n) { member(n.argument) },
    Unary: function (n) { childs.push(n.argument) },
    Binary: function (n) {
      childs.push(n.left)
      childs.push(n.right)
    },
    IdentifierAssignment: function (n) { childs.push(n.right) },
    IdentifierBinaryAssignment: function (n) { childs.push(n.right) },
    MemberAssignment: function (n) {
      member(n)
      childs.push(n.right)
    },
    MemberBinaryAssignment: function (n) {
      member(n)
      childs.push(n.right)
    },
    IdentifierUpdate: nil,
    MemberUpdate: function (n) { member(n.argument) },
    Logical: function (n) {
      childs.push(n.left)
      childs.push(n.right)
    },
    Conditional: function (n) {
      childs.push(n.test)
      childs.push(n.consequent)
      childs.push(n.alternate)
    },
    New: function (n) {
      childs.push(n.callee)
      nodes(n.arguments)
    },
    MemberCall: function (n) {
      member(n.callee)
      nodes(n.arguments)
    },
    EvalCall: function (n) { nodes(n.arguments) },
    Call: function (n) {
      childs.push(n.callee)
      nodes(n.arguments)
    },
    Member: function (n) { member(n) },
    Identifier: nil,
    Literal: nil
  }

  return { visit:visit, mark:function (node) { workerlist.push(node) } }


}
