# Esvisit

Esvisit is a simple npm module for visiting JavaScript abstract syntax trees that are compatible with Mozilla parser API as described in https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Programs.
This module supports exclusvely ECMAScript5 as described in http://www.ecma-international.org/ecma-262/5.1/.
Benefits of using Esvisit includes:
* Process iteratively and avoid recursion.
* Get an alternative type that better reflects JavaScript semantic.
* Visit only actual statements and expressions.

## Demonstration

```javascript
var Esvisit = require('esvisit');
var Esprima = require('esprima');

function indent () { return (new Array(depth+1)).join("  ") }
function visitStatement (type, stmt) { visit('Statement', type, stmt) }
function visitExpression (type, expr) { visit('Expression', type, expr) }
function visit (kind, type, node) {
  var id = ++counter;
  console.log(indent()+'Begin'+kind+id+': '+type+'('+Esvisit.ExtractInformation(type, node).join(", ")+')')
  depth++
  push(function () {
    depth--
    console.log(indent()+'End'+id)
  })
}

var code = 'o.a = eval("2*"+x);' // Your JS code here...
var ast = Esprima.parse(code)
var counter = 0;
var depth = 0;
var push = Esvisit.Prepare(visitStatement, visitExpression)

push(ast)
```

Output:

```
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

## API

This module exposes four functions:
* `Prepare(StatementCallback, ExpressionCallBack)`: prepare upcoming visits ; returns a function to push something on the worker list. Callbacks are called with: the Esvisit type of the current node and the current node itself. Esvisit types are described in the sections 'Statement Types' and 'Expression Types'
* `ExtractInformation(EsvisitType, Node)`
* `ExtractStatementInformation(EsvisitType, Statement)`
* `ExtractExpressionInformation(EsvisitType, Expression)`

## Statement Types

Type | Interpretation | Information
:----|:---------------|:-----------
`Empty` | alias for `EmptyStatement` | `[]`
`Strict` | `'use strict';` | []
`Block` | * | `[Length]`
`Expression` | * | `[]`
`If` | * | `[HasAlternate]`
`Label` | * | `[Label]`
`Break` | * | `[MaybeLabel]`
`Continue` | * | `[MaybeLabel]`
`With` | * | `[]`
`Switch` | * | `[Cases::[IsDefault, Length]]`
`Return` | * | `[HasValue]`
`Throw` | * | `[]`
`Try` | * | `[BodyLength, MaybeCatchParameter, MaybeCatchLength, MaybeFinalizerLength]`
`While` | * | `[]`
`DoWhile` | * | `[]`
`DeclarationFor` | `for (VAR_DECL; EXPR; EXPR) STMT` | `[Declarators::[Name, HasInit], HasTest, HasUpdate]`
`For` | `for (EXPR; EXPR; EXPR) STMT` | `[HasInit, HasTest, HasUpdate]`
`IdentifierForIn` | `for (ID in EXPR) STMT` | `[Name]`
`MemberForIn` | `for (MEMBER in EXPR) STMT` | `[MaybeProperty]`
`DeclarationForIn` | `for (var ID [=EXPR] in EXPR) STMT` | `[Name, HasInit]`
`Definition` | alias for `FunctionDeclaration` | `[Name, Parameters::[Name], BodyLength]`
`Declaration` | alias for `VariableDeclaration` | `[Declarators::[Name, HasInit]]`

(*): Add `Statement` to the type to obtain the Mozilla alias.

## Expression Types

Type | Interpretation | Information
:----|:---------------|:-----------
`This` | alias for `ThisExpression` | `[]`
`Array` | ** | `[Elements::[IsInitialized]]`
`Object` | ** | `[Properties::[KeyValue, Kind, MaybeParameter, MaybeBodyLength]]`
`Function` | ** | `[MaybeName, Parameters::[Name], BodyLength]`
`Sequence` | ** | `[Length]`
`IdentifierTypeof` | `typeof ID` | `[Name]`
`IdentifierDelete` | `delete ID` | `[Name]`
`MemberDelete` | `delete MEMBER` | `[MaybeProperty]`
`Unary` | ** | `[Operator]`
`Binary` | ** | `[Operator]`
`IdentifierAssignment` | `ID ASS_OP EXPR` | `[Name, Operator]`
`MemberAssignment` | `MEMBER ASS_OP EXPR` | `[MaybeProperty, Operator]`
`IdentifierUpdate` | `++ID`, `--ID`, `ID++`, `ID--` | `[IsPrefix, Operator, Name]`
`MemberUpdate` | `++MEMBER`, `--MEMBER`, `MEMBER++`, `MEMBER--` | `[IsPrefix, Operator, MaybeProperty]`
`Logical` | ** | `[Operator]`
`Conditional` | ** | `[]`
`New` | ** | `[ArgumentsLength]`
`MemberCall` | `MEMBER(EXPRS)` | `[MaybeProperty, ArgumentsLength]`
`EvalCall` | `eval(EXPRS)` | `[ArgumentsLength]`
`Call` | `EXPR(EXPRS)` | `[ArgumentsLength]`
`Member` | ** | `[MaybeProperty]`
`Identifier` | alias for `Identifier` | `[Name]`
`Literal` | alias for `Literal` | `[Value]`

(**): Add `Expression` to the type to obtain the Mozilla alias.

