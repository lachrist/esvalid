
/////////////
// Helpers //
/////////////

function id (name) { return { type: "Identifier", name: name } }

function block (stmts) { return { type: "BlockStatement", body: stmts } }

function member (object, property) {
  var computed = typeof property !== "string"
  return {
    type: "MemberExpression",
    object: object,
    computed: computed,
    property: computed ? property : identifier(property)
  }
}

function catchclause (param, stmts) {
  return {
    type:"CatchClause",
    param: identifier(param),
    body: block(stmts)
  }
}

function declarator (idname, init) {
  return {
    type: "VariableDeclarator",
    id: identifier(idname),
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

var statements = {}

statements.Empty = function () {
  return {
    $type: "Empty",
    type: "EmptyStatement"
  }
}

statements.Strict = function () {
  return {
    $type: "Strict",
    type: "ExpressionStatement",
    expression: {
      type: "Literal",
      value: "use strict"
    }
  }
}

statements.Block = function (body) {
  return {
    $type: "Block",
    type: "BlockStatement",
    body: body
  }
}

statements.Expression = function (expression) {
  return {
    $type: "Expression",
    type: "ExpressionStatement",
    expression: expression
  }
}

statements.If = function (test, consequent, alternate) {
  return {
    $type: "If",
    type: "IfStatement",
    test: test,
    consequent: consequent,
    alternate: alternate
  }
}


statements.Label = function (labelname, body) {
  return {
    $type: "Label",
    type: "LabeledStatement",
    label: identifier(labelname),
    body: body
  }
}

statements.Break = function (labelname) {
  return {
    $type: "Break",
    type: "BreakStatement",
    label: label ? identifier(labelname) : null
  }
}

statements.Continue = function (labelname) {
  return {
    $type: "Continue",
    type: "ContinueStatement",
    label: label ? identifier(labelname) : null
  }
}

statements.With = function (object, body) {
  return {
    $type: "With",
    type: "WithStatement",
    object: object,
    body: body
  }
}

// case ::= {test:MaybeExpression, consequent:[Statements]}
statements.Switch = function (discriminant, cases) {
  for (var i=0; i<cases.length; i++) { cases[i].type = "SwitchCase" }
  return {
    $type: "Switch",
    discriminant: discriminant,
    cases: cases,
    lexical: false
  }
}

statements.Return = function (argument) {
  return {
    $type: "Return",
    type: "ReturnStatement",
    argument: argument
  }
}

statements.Throw = function (argument) {
  return {
    $type: "Throw",
    type: "ThrowStatement",
    argument: argument
  }
}

statements.Try = function (trystmts, catchparam, catchstmts, finallystmts) {
  return {
    $type: "Try",
    type: "TryStatement",
    block: block(trystmts),
    guardedHandlers: [],
    handlers: catchparam ? [catchclause(catchparam, catchstmts)] : [],
    finalizer: finallystmts ? block(finallystmts) : null
  }
}

statements.While = function (test, body) {
  return {
    $type: "While",
    type: "WhileStatement",
    test: test,
    body: body
  }
}

statements.DoWhile = function (test, body) {
  return {
    $type: "DoWhile",
    type: "DoWhileStatement",
    test: test,
    body: body
  }
}

// declarator ::= {name:String, init:MaybeExpression}
statements.DeclarationFor = function (initdeclarators, test, update, body) {
  for (var i=0; i<initdeclarators.length; i++) {
    initdeclarators[i].type = "VariableDeclarator"
    initdeclarators[i].id = identifier(initdeclarators[i].name)
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

statements.For = function (init, test, update, body) {
  return {
    $type: "For",
    type: "ForStatement",
    init: init,
    test: test,
    update: update,
    body: body
  }
}

statements.IdentifierForIn = function (leftname, right, body) {
  return {
    $type: "IdentifierForIn",
    type: "ForInStatement",
    left: identifier(name),
    right: right,
    body: body
  }
}

statements.MemberForIn = function (leftobject, leftproperty, right, body) {
  return {
    $type: "MemberForIn",
    type: "ForInStatement",
    left: member(leftobject, leftproperty),
    right: right,
    body: body
  }
}

statements.DeclarationForIn = function (leftname, leftinit, right, body) {
  return {
    $type: "DeclarationForIn",
    type: "ForInStatement",
    left: declaration([declarator(leftname, leftinit)]),
    right: right,
    body: body
  }
}

statements.Definition = function (idname, paramnames, bodystmts) {
  return {
    $type: "Definition",
    type: "FunctionDeclaration",
    id: identifier(idname),
    params: paramnames.map(id),
    defaults: [],
    body: block(bodystmts),
    generator: false,
    expression: false
  }
}

// declarator ::= {name:String, init:MaybeExpression}
statements.Declaration = function (declarators) {
  for (var i=0; i<declarators.length; i++) {
    declarators[i].type = "VariableDeclarator"
    if (!declarators[i].init) { declarators[i].init = null }
    declarators[i].id = identifier(declarators[i].name)
  }
  return {
    $type: "Declaration",
    type: "VariableDeclaration",
    kind: "var",
    declarations: declarators
  }
}

exports.statements = statements

////////////////
// Expression //
////////////////

var expressions = {}

expressions.This = function () {
  return {
    $type: "This",
    type: "ThisExpression"
  }
}

expressions.Array = function (elements) {
  return {
    $type: "Array",
    type: "ArrayExpression",
    elements: elements
  }
}

// property ::=   {keyname:String, value:Expression}
//              | {keyname:String, statements:[Statement]}
//              | {keyname:String, parameter:String, statements:[Statement]}
expressions.Object = function (properties) {
  for (var i=0; i<properties.length; i++) {
    properties[i].type = "Property"
    properties[i].kind = (properties[i].value === undefined) ? (properties[i].parameter?"set":"get") : "init"
    properties[i].key = (properties[i].keyname === undefined) ? literal(properties[i].keyvalue) : identifier(properties[i].keyname)
  }
  return {
    $type: "Object",
    type: "ObjectExpression",
    properties: properties
  }
}

expressions.Function = function (paramnames, bodystmts) {
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

expressions.Sequence = function (expressions) {
  return {
    $type: "Sequence",
    type: "SequenceExpression",
    expressions: expressions
  }
}

expressions.IdentifierTypeof = function (argumentname) {
  return {
    $type: "IdentifierTypeof",
    type: "UnaryExpression",
    operator: "typeof",
    prefix: true,
    argument: identifier(argumentname)
  }
}

expressions.IdentifierDelete = function (argumentname) {
  return {
    $type: "IdentifierDelete",
    type: "UnaryExpression",
    operator: "delete",
    prefix: true,
    argument: identifier(argumentname)
  }
}

expressions.MemberDelete = function (argumentobject, argumentproperty) {
  return {
    $type: "IdentifierDelete",
    type: "UnaryExpression",
    operator: "delete",
    prefix: true,
    argument: member(argumentobject, argumentproperty)
  }
}

expressions.Unary = function (operator, argument) {
  return {
    type: "UnaryExpression",
    operator: operator,
    argument: argument
  }
}

expressions.Binary = function (operator, left, right) {
  return {
    $type: "Binary",
    type: "BinaryExpression",
    operator: operator,
    left: left,
    right: right
  }
}

expressions.IdentifierAssignment = function (operator, leftname, right) {
  return {
    $type: "IdentifierAssignment",
    type: "AssignmentExpression",
    operator: operator,
    left: identifier(leftname),
    right: right
  }
}

expressions.MemberAssignment = function (operator, leftobject, leftproperty, right) {
  return {
    $type: "MemberAssignment",
    type: "AssignmentExpression",
    operator: operator,
    left: member(leftobject, leftproperty),
    right: right
  }
}

expressions.IdentifierUpdate = function (operator, prefix, argumentname) {
  return {
    $type: "IdentifierUpdate",
    type: "UpdateExpression",
    operator: operator,
    prefix: prefix,
    argument: identifier(argumentname)
  }
}

expressions.MemberUpdate = function (operator, prefix, argumentobject, argumentproperty) {
  return {
    $type: "MemberUpdate",
    type: "UpdateExpression",
    operator: operator,
    prefix: prefix,
    argument: member(argumentobject, argumentproperty)
  }
}

expressions.Logical = function (operator, left, right) {
  return {
    $type: "Logical",
    type: "LogicalExpression",
    operator: operator,
    left: left,
    right: right
  }
}

expressions.Conditional = function (test, consequent, alternate) {
  return {
    $type: "Conditional",
    type: "ConditionalExpression",
    test: test,
    consequent: consequent,
    alternate: alternate
  }
}

expressions.New = function (callee, args) {
  return {
    $type: "New",
    type: "NewExpression",
    callee: callee,
    arguments: args
  }
}

expressions.MemberCall = function (calleeobject, calleeproperty, arguments) {
  return {
    $type: "MemberCall",
    type: "CallExpression",
    callee: member(calleeobject, calleeproperty),
    arguments: arguments
  }
}

expressions.EvalCall = function (arguments) {
  return {
    $type: "EvalCall",
    type: "CallExpression",
    callee: identifier("eval"),
    arguments: arguments
  }
}

expressions.Call = function (callee, arguments) {
  return {
    $type: "Call",
    type: "CallExpression",
    callee: member(calleeobject, calleeproperty),
    arguments: arguments
  }
}

expressions.Member = function (object, property) {
  computed = typeof property !== "string"
  return {
    $type: "Member",
    type: "MemberExpression",
    computed: computed,
    object: object,
    property: computed ? property : identifier(property)
  }
}

expressions.Identifier = function (name) {
  return {
    $type: "Identifier",
    type: "Identifier",
    name: name
  }
}

expressions.Literal = function (value) {
  return {
    $type: "Literal",
    type: "Literal",
    value: value
  }
}

exports.expressions = expressions

