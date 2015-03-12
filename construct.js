
/////////////
// Helpers //
/////////////

function id (name) { return { type: "Identifier", name: name } }

function block (stmts) { return { type: "BlockStatement", body: stmts }

function member (object, property) {
  var computed = typeof property !== "string"
  return {
    type: "MemberExpression",
    object: object,
    computed: computed,
    property: computed ? property : id(property)
  }
}

function catchclause (param, stmts) {
  return {
    type:"CatchClause",
    param: id(param),
    body: block(stmts)
  }
}

function declarator (idname, init) {
  return {
    type: "VariableDeclarator",
    id: id(idname),
    init: init
  }
}

function declaration (declarators) {
  return {
    type: "VariableDeclaration",
    declarations: declarators,
    kind: "var"
  }
}

function literal (value) {
  return {
    type: "Literal",
    value: value
  }
}

////////////////
// Statements //
////////////////

exports.Empty = function () {
  return {
    $type: "Empty",
    type: "EmptyStatement"
  }
}

exports.Strict = function () {
  return {
    $type: "Strict",
    type: "ExpressionStatement",
    expression: {
      type: "Literal",
      value: "use strict"
    }
  }
}

exports.Block = function (body) {
  return {
    $type: "Block",
    type: "BlockStatement",
    body: body
  }
}

exports.Expression = function (expression) {
  return {
    $type: "Expression",
    type: "ExpressionStatement",
    expression: expression
  }
}

exports.If = function (test, consequent, alternate) {
  return {
    $type: "If",
    type: "IfStatement",
    test: test,
    consequent: consequent,
    alternate: alternate
  }
}


exports.Label = function (labelname, body) {
  return {
    $type: "Label",
    type: "LabeledStatement",
    label: id(labelname),
    body: body
  }
}

exports.Break = function (labelname) {
  return {
    $type: "Break",
    type: "BreakStatement",
    label: label ? id(labelname) : null
  }
}

exports.Continue = function (labelname) {
  return {
    $type: "Continue",
    type: "ContinueStatement",
    label: label ? id(labelname) : null
  }
}

exports.With = function (object, body) {
  return {
    $type: "With",
    type: "WithStatement",
    object: object,
    body: body
  }
}

// case ::= {test:MaybeExpression, consequent:[Statements]}
exports.Switch = function (discriminant, cases) {
  for (var i=0; i<cases.length; i++) { cases[i].type = "SwitchCase" }
  return {
    $type: "Switch",
    discriminant: discriminant,
    cases: cases,
    lexical: false
  }
}

exports.Return = function (argument) {
  return {
    $type: "Return",
    type: "ReturnStatement",
    argument: argument
  }
}

exports.Throw = function (argument) {
  return {
    $type: "Throw",
    type: "ThrowStatement",
    argument: argument
  }
}

exports.Try = function (trystmts, catchparam, catchstmts, finallystmts) {
  return {
    $type: "Try",
    type: "TryStatement",
    block: block(trystmts),
    guardedHandlers: [],
    handlers: catchparam ? [catchclause(catchparam, catchstmts)] : [],
    finalizer: finallystmts ? block(finallystmts) : null
  }
}

exports.While = function (test, body) {
  return {
    $type: "While",
    type: "WhileStatement",
    test: test,
    body: body
  }
}

exports.DoWhile = function (test, body) {
  return {
    $type: "DoWhile",
    type: "DoWhileStatement",
    test: test,
    body: body
  }
}

// declarator ::= {name:String, init:MaybeExpression}
exports.DeclarationFor = function (initdeclarators, test, update, body) {
  for (var i=0; i<initdeclarators.length; i++) {
    initdeclarators[i].type = "VariableDeclarator"
    initdeclarators[i].id = id(initdeclarators[i].name)
  }
  return {
    $type: "DeclarationFor",
    type: "ForStatement",
    init: declaration(initdeclarators),
    test: test,
    update: update,
    body: body
  }
}

exports.For = function (init, test, update, body) {
  return {
    $type: "For",
    type: "ForStatement",
    init: init,
    test: test,
    update: update,
    body: body
  }
}

exports.IdentifierForIn = function (leftname, right, body) {
  return {
    $type: "IdentifierForIn",
    type: "ForInStatement",
    left: id(name),
    right: right,
    body: body
  }
}

exports.MemberForIn = function (leftobject, leftproperty, right, body) {
  return {
    $type: "MemberForIn",
    type: "ForInStatement",
    left: member(leftobject, leftproperty),
    right: right,
    body: body
  }
}

exports.DeclarationForIn = function (leftname, leftinit, right, body) {
  return {
    $type: "DeclarationForIn",
    type: "ForInStatement",
    left: declaration([declarator(leftname, leftinit)])
    right: right,
    body: body
  }
}

exports.Definition = function (idname, paramnames, bodystmts) {
  return {
    $type: "Definition",
    type: "FunctionDeclaration",
    id: id(idname),
    params: paramnames.map(id),
    defaults: [],
    body: block(bodystmts),
    generator: false,
    expression: false
  }
}

// declarator ::= {name:String, init:MaybeExpression}
exports.Declaration = function (declarators) {
  for (var i=0; i<declarators.length; i++) {
    declarators[i].type = "VariableDeclarator"
    declarators[i].id = id(declarators[i].name)
  }
  return {
    $type: "Declaration",
    type: "VariableDeclaration",
    declarations: declarators)
    kind: "var"
  }
}

////////////////
// Expression //
////////////////

exports.This = function () {
  return {
    $type: "This",
    type: "ThisExpression"
  }
}

exports.Array = function (elements) {
  return {
    $type: "Array"
    type: "ArrayExpression",
    elements: elements
  }
}

// property ::=   {keyname:String, value:Expression}
//              | {keyname:String, statements:[Statement]}
//              | {keyname:String, parameter:String, statements:[Statement]}
exports.Object = function (properties) {
  for (var i=0; i<properties.length; i++) {
    properties[i].type = "Property"
    properties[i].kind = (properties[i].value === undefined) ? (properties[i].parameter?"set":"get") : "init"
    properties[i].key = (properties[i].keyname === undefined) ? literal(properties[i].keyvalue) : id(properties[i].keyname)
  }
  return {
    $type: "Object",
    type: "ObjectExpression",
    properties: properties
  }
}

exports.Function = function (paramnames, bodystmts) {
  return {
    $type: "Function",
    type: "FunctionExpression",
    id: null,
    params: paramnames.map(id),
    defaults: [],
    body: block(bodystmts),
    generator: false,
    expression: false
  }
}

exports.Sequence = function (expressions) {
  return {
    $type: "Sequence",
    type: "SequenceExpression",
    expressions: expressions
  }
}

exports.IdentifierTypeof = function (argumentname) {
  return {
    $type: "IdentifierTypeof",
    type: "UnaryExpression",
    operator: "typeof",
    prefix: true,
    argument: id(argumentname)
  }
}

exports.IdentifierDelete = function (argumentname) {
  return {
    $type: "IdentifierDelete",
    type: "UnaryExpression",
    operator: "delete",
    prefix: true,
    argument: id(argumentname)
  }
}

exports.MemberDelete = function (argumentobject, argumentproperty) {
  return {
    $type: "IdentifierDelete",
    type: "UnaryExpression",
    operator: "delete",
    prefix: true,
    argument: member(argumentobject, argumentproperty)
  }
}

exports.Unary = function (operator, argument) {
  return {
    type: "UnaryExpression",
    operator: operator,
    argument: argument
  }
}

exports.Binary = function (operator, left, right) {
  return {
    $type: "Binary",
    type: "BinaryExpression",
    operator: operator,
    left: left,
    right: right
  }
}

exports.IdentifierAssignment = function (operator, leftname, right) {
  return {
    $type: "IdentifierAssignment",
    type: "AssignmentExpression",
    operator: operator,
    left: id(leftname),
    right: right
  }
}

exports.MemberAssignment = function (operator, leftobject, leftproperty, right) {
  return {
    $type: "MemberAssignment",
    type: "AssignmentExpression",
    operator: operator,
    left: member(leftobject, leftproperty),
    right: right
  }
}

exports.IdentifierUpdate = function (operator, argumentname) {
  return {
    $type: "IdentifierUpdate",
    type: "UpdateExpression",
    argument: id(argumentname)
  }
}

exports.MemberUpdate = function (operator, argumentobject, argumentproperty) {
  return {
    $type: "MemberUpdate",
    type: "UpdateExpression",
    argument: member(argumentobject, argumentproperty)
  }
}

exports.Logical = function (operator, left, right) {
  return {
    $type: "Logical",
    type: "LogicalExpression",
    operator: operator,
    left: left,
    right: right
  }
}

exports.Conditional = function (test, consequent, alternate) {
  return {
    $type: "Conditional"
    type: "ConditionalExpression",
    test: test,
    consequent: consequent,
    alternate: alternate
  }
}

exports.New = function (callee, args) {
  return {
    $type: "New",
    type: "NewExpression",
    callee: callee,
    arguments: args
  }
}

exports.MemberCall = function (calleeobject, calleeproperty, arguments) {
  return {
    $type: "MemberCall",
    type: "CallExpression",
    callee: member(calleeobject, calleeproperty),
    arguments: arguments
  }
}

exports.EvalCall = function (arguments) {
  return {
    $type: "EvalCall",
    type: "CallExpression",
    callee: id("eval"),
    arguments: arguments
  }
}

exports.Call = function (callee, arguments) {
  return {
    $type: "Call",
    type: "CallExpression",
    callee: member(calleeobject, calleeproperty),
    arguments: arguments
  }
}

exports.Member = function (object, property) {
  computed = typeof property !== "string"
  return {
    $type: "Member",
    type: "MemberExpression",
    computed: computed,
    object: object,
    property: computed ? property : id(property)
  }
}

exports.Identifier = function (name) {
  return {
    $type: "Identifier",
    type: "Identifier",
    name: name
  }
}

exports.Literal = function (value) {
  return {
    $type: "Literal"
    type: "Literal",
    value: value
  }
}
