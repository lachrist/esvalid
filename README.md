# Esvisit

Esvisit is a simple npm module for visiting JavaScript abstract syntax trees that are compatible with the Mozilla parser API as described in https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Programs.
This module supports exclusvely ECMAScript5 as described in http://www.ecma-international.org/ecma-262/5.1/.
Benefits of using Esvisit includes:
* Process iteratively and avoid recursion.
* Get an alternative type that better reflects JavaScript semantic.
* Visit only actual statements and expressions.

For instance the statement `o.a(1);` will trigger the below visits:
  1. `Expression`; The whole statement expression `o.a(1);`.
  2. `MemberCall`; The member call: `o.a(1)`. 
  3. `Identifier`; the object callee (this argument): `o`.
  4. `Literal`; the unique argument: `1`.

## API

This module exposes four functions:
* `Visit(Node, StatementCallback, ExpressionCallBack)` where the callbacks are called with:
  1. `EsvisitType`: the type of the node according to section 'Statement Types' and 'Expression Types'.
  2. `Node`: current node being visited.
  3. `Ondone`: add a function to be called when all the (recursive) childs of the `Node` parameter has been visited.
* `ExtractInformation(EsvisitType, Node)`
* `ExtractStatementInformation(EsvisitType, Statement)`
* `ExtractExpressionInformation(EsvisitType, Expression)`

## Demonstration

```javascript
var Esvisit = require('esvisit');
var Esprima = require('esprima');

var code = 'o.a = eval("2*"+x);' // Your JS code here...
var ast = Esprima.parse(code)

var counter = 0;
var depth = 0;
function indent () { return (new Array(depth+1)).join("  ") }
function visitStatement (type, stmt, ondone) { visit('Statement', type, stmt, ondone) }
function visitExpression (type, expr, ondone) { visit('Expression', type, expr, ondone) }
function visit (kind, type, node, ondone) {
  var id = ++counter;
  console.log(indent()+'Begin'+kind+id+': '+type+'('+Esvisit.ExtractInformation(type, node).join(", ")+')')
  depth++
  ondone(function () {
    depth--
    console.log(indent()+'End'+id)
  })
}

Esvisit.Visit(ast, visitStatement, visitExpression)
```

Output:

```shell
BeginStatement1: Expression()
  BeginExpression2: MemberAssignment(a, =)
    BeginExpression3: EvalCall(1)
      BeginExpression4: Binary(+)
        BeginExpression5: Literal(2*)
        End5
        BeginExpression6: Identifier(x)
        End6
      End4
    End3
    BeginExpression7: Identifier(o)
    End7
  End2
End1
```

## Statement Types

Type | Interpretation | Information
:----|:---------------|:-----------
`Empty` | alias for `EmptyStatement` | `[]`
`Block` | * | `[Length]`
`Expression` | * | `[]`
`If` | * | `[HasAlternate]`
`Labeled` | * | `[Label]`
`Break` | * | `[MaybeLabel]`
`Continue` | * | `[MaybeLabel]`
`With` | * | `[]`
`Switch` | * | `[Cases::[IsDefault, Length]]`
`Return` | * | `[HasValue]`
`Throw` | * | `[]`
`Try` | * | `[BodyLength, MaybeCatchParameter, MaybeCatchLength, MaybeFinalizerLength]`
`While` | * | `[]`
`DoWhile` | * | `[]`
`DeclarationFor` | `for (VAR_DECL; EXPR; EXPR) STMT` | `[Declarations::[Name, HasInit], HasTest, HasUpdate]`
`For` | `for (EXPR; EXPR; EXPR) STMT` | `[HasInit, HasTest, HasUpdate]`
`IdentifierForIn` | `for (ID in EXPR) STMT` | `[Name]`
`MemberForIn` | `for (MEMBER in EXPR) STMT` | `[MaybeProperty]`
`DeclarationForIn` | `for (var ID [=EXPR] in EXPR) STMT` | `[Name, HasInit]`
`Definition` | alias for `FunctionDeclaration` | `[Name, Parameters::[Name], BodyLength]`
`Declaration` | alias for `VariableDeclaration` | `[Declarations::[Name, HasInit]]`

(*): Add `Statement` to the type to obtain the Mozilla alias.

## Expression Types

Type | Interpretation | Information
:----|:---------------|:-----------
`This` | alias for `ThisExpression` | `[]`
`Array` | ** | `[Elements::[IsInitialized]]`
`Object` | ** | `[Properties::[KeyValue, Kind, MaybeBodyLength]]`
`Function` | ** | `[MaybeName, Parameters::[Name], BodyLength]`
`Sequence` | ** | `[Length]`
`IdentifierTypeof` | `typeof ID` | `[Name]`
`IdentifierDelete` | `delete ID` | `[Name]`
`MemberDelete` | `delete MEMBER` | `[MaybeProperty]`
`Unary` | ** | `[Operator]`
`Binary` | ** | `[Operator]`
`IdentifierAssignment` | `ID ASS_OP EXPR` | `[Name, Operator]`
`MemberAssignment` | `MEMBER ASS_OP EXPR` | `[MaybeProperty, Operator]`
`IdentifierUpdate` | `++ID | --ID | ID++ | ID--` | `[IsPrefix, Operator, Name]`
`MemberUpdate` | `++MEMBER | --MEMBER | MEMBER++ | MEMBER--` | `[IsPrefix, Operator, MaybeProperty]`
`Logical` | ** | `[Operator]`
`Conditional` | ** | `[]`
`New` | ** | `[ArgumentsLength]`
`MemberCall` | `MEMBER(EXPRS)` | `[MaybeProperty, ArgumentsLength]`
`EvalCall` | `eval(EXPRS)` | `[ArgumentsLength]`
`Call` | `EXPR(EXPRS)` | `[ArgumentsLength]`
`Member` | ** | `[MaybeProperty]`
`Identifier` | alias for `Identifier` | [Name] 
`Literal` | alias for `Literal` | [Value]

(**): Add `Expression` to the type to obtain the Mozilla alias.

