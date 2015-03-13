
module.exports = function (node) { return (types[node.type] || clean)(node) }

function clean (node) { return node.type.replace(/Statement$/, "").replace(/Expression$/, "") }

function left (n) {
  if (l.type === "Identifier") { return "Identifier" }
  if (l.type === "MemberExpression") { return "Member" }
  throw new Error("Unexpected left-hand side: "+l.type)
}

var types = {
  Identifier:           function (n) { return "Identifier" },
  Literal:              function (n) { return "Literal" },
  FunctionDeclaration:  function (n) { return "Definition" },
  VariableDeclaration:  function (n) { return "Declaration" },
  AssignmentExpression: function (n) { return left(n.left)+"Assignment" },
  UpdateExpression:     function (n) { return left(n.argument)+"Update" },
  ExpressionStatement:  function (n) { return (n.expression.value === "use strict" ? "Strict" : "Expression") },
  ForStatement:         function (n) { return (n.init.type==="VariableDeclaration" ? "Declaration" : "") + "For" },
  ForInStatement:       function (n) { return (n.left.type === "VariableDeclaration" ? "Declaration" : left(n.left)) + "For" },
  CallExpression:       function (n) { return (n.callee.name === "eval" ? "Eval" : (n.callee.type === "Member" ? "Member" : "")) + "Call" },
  UnaryExpression:      function (n) {
    if (n.operator === "typeof" && n.argument.type === "Identifier") { return "IdentifierTypeof" }
    if (n.operator === "delete" && n.argument.type === "Identifier") { return "IdentifierDelete" }
    if (n.operator === "delete" && n.argument.type === "MemberExpression") { return "MemberDelete" }
    return "Unary"
  }
}
