
exports.node = function (type, node) { return (stmts[type]||exprs[type])(node) }
exports.statement = function (type, stmt) { return stmts[type](stmt) }
exports.expression = function (type, expr) { return exprs[type](expr) }

/////////////
// Helpers //
/////////////

function empty () { return [] }
function member (m) { return m.computed?null:m.property.name }
function identifier (i) { return i?i.name:null }
function declaration (d) { return [d.id.name, Boolean(d.init)] }
function switchcase (c) { return [Boolean(c.test), c.consequent.length] }
function property (p) { return [p.key.type==="Literal"?p.key.value:p.key.name, p.kind, p.kind==="init"?null:p.value.body.length] }

////////////////
// Statements //
////////////////

stmts = {}

stmts.Empty            = empty
stmts.Block            = function (n) { return [n.body.length] }
stmts.Expression       = empty
stmts.If               = function (n) { return [Boolean(n.alternate)] }
stmts.Labeled          = empty
stmts.Break            = function (n) { return [identifier(n.label)] }
stmts.Continue         = function (n) { return [identifier(n.label)] }
stmts.With             = empty
stmts.Switch           = function (n) { return [n.cases.map(switchcase)] }
stmts.Return           = function (n) { return [Boolean(n.argument)] }
stmts.Throw            = empty
stmts.Try              = function (n) { return [n.block.length, n.handler?identifier(n.handler.param):null, n.handler?n.handler.body.body.length:null, n.finalizer?n.finalizer.body.length:null] }
stmts.While            = empty
stmts.DoWhile          = empty
stmts.DeclarationFor   = function (n) { return [n.init.declarations.map(declaration), Boolean(n.test), Boolean(n.update)] }
stmts.For              = function (n) { return [Boolean(n.init), Boolean(n.test), Boolean(n.update)] }
stmts.IdentifierForIn  = function (n) { return [identifier(n.left)] }
stmts.MemberForIn      = function (n) { return [member(n.left)] }
stmts.DeclarationForIn = function (n) { return declaration(n.left.declarations[0]) }
stmts.Definition       = function (n) { return [identifier(n.id), n.params.map(identifier), n.body.body.length] }
stmts.Declaration      = function (n) { return [n.declarations.map(declaration)] }

/////////////////
// Expressions //
/////////////////

var exprs = {}

exprs.This                 = empty
exprs.Array                = function (n) { return [n.elements.map(Boolean)] }
exprs.Object               = function (n) { return [n.properties.map(property)] }
exprs.Function             = function (n) { return [identifier(n.id), n.params.map(identifier), n.body.body.length] }
exprs.Sequence             = function (n) { return [n.expressions.length] }
exprs.IdentifierTypeof     = function (n) { return [identifier(n.argument)] }
exprs.IdentifierDelete     = function (n) { return [identifier(n.argument)] }
exprs.MemberDelete         = function (n) { return [member(n.argument)] }
exprs.Unary                = function (n) { return [n.operator] }
exprs.Binary               = function (n) { return [n.operator] }
exprs.IdentifierAssignment = function (n) { return [identifier(n.left), n.operator] }
exprs.MemberAssignment     = function (n) { return [member(n.left), n.operator] }
exprs.IdentifierUpdate     = function (n) { return [n.prefix, n.operator, identifier(n.argument)] }
exprs.MemberUpdate         = function (n) { return [n.prefix, n.operator, member(n.argument)] }
exprs.Logical              = function (n) { return [n.operator] }
exprs.Conditional          = empty
exprs.New                  = function (n) { return [n.arguments.length] }
exprs.MemberCall           = function (n) { return [member(n.callee), n.arguments.length] }
exprs.EvalCall             = function (n) { return [n.arguments.length] }
exprs.Call                 = function (n) { return [n.arguments.length] }
exprs.Member               = function (n) { return [member(n)] }
exprs.Identifier           = function (n) { return [identifier(n)] }
exprs.Literal              = function (n) { return [n.value] }





