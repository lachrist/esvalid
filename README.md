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

## Demonstration

```javascript
var Esvisit = require('esvisit');
var Esprima = require('esprima');

var code = 'o.a = eval("2*"+x);'; // Your JS code here...
var ast = Esprima.parse(code);

var counter = 0;
var depth = 0;
function indent () { return (new Array(depth+1)).join("  ") }
function visitStatement (type, stmt, ondone) { visit('statement', type, stmt, ondone) }
function visitExpression (type, expr, ondone) { visit('expression', type, expr, ondone) }
function visit (kind, type, node, ondone) {
  var id = ++counter;
  console.log(indent()+'Begin '+kind+': '+type+' (nodeID: '+id+')')
  depth++
  ondone(function () {
    depth--
    console.log(indent()+'End '+kind+': '+type+' (nodeID: '+id+')')
  })
}

Esvisit(ast, visitStatement, visitExpression)
```

Output:

```shell
Begin statement: Expression (nodeID: 1)
  Begin expression: MemberAssignment (nodeID: 2)
    Begin expression: Eval (nodeID: 3)
      Begin expression: Binary (nodeID: 4)
        Begin expression: Literal (nodeID: 5)
        End expression: Literal (nodeID: 5)
        Begin expression: Identifier (nodeID: 6)
        End expression: Identifier (nodeID: 6)
      End expression: Binary (nodeID: 4)
    End expression: Eval (nodeID: 3)
    Begin expression: Identifier (nodeID: 7)
    End expression: Identifier (nodeID: 7)
  End expression: MemberAssignment (nodeID: 2)
End statement: Expression (nodeID: 1)
```

## Statement Types

Type | Interpretation
:----|:--------------
`Empty` | alias for `EmptyStatement`
`Block` | *
`Expression` | *
`If` | *
`Labeled` | *
`Break` | *
`Continue` | *
`With` | *
`Switch` | *
`Return` | *
`Throw` | *
`Try` | *
`While` | *
`DoWhile` | *
`For` | `for (EXPR; EXPR; EXPR) STMT`
`DeclarationFor` | `for (VAR_DECL; EXPR; EXPR) STMT`
`IdentifierForIn` | `for (ID in EXPR) STMT`
`MemberForIn` | `for (MEMBER in EXPR) STMT`
`DeclarationForIn` | `for (var ID [=EXPR] in EXPR) STMT`
`Function` | alias for `FunctionDeclaration`
`Variable` | alias for `VariableDeclaration`

(*): Add `Statement` to the type to obtain the Mozilla alias.

## Expression Types

Type | Interpretation
:----|:--------------
`This` | alias for `ThisExpression`
`Array` | **
`Object` | **
`Function` | **
`Sequence` | **
`Unary` | **
`IdentifierTypeof` | `typeof ID`
`IdentifierDelete` | `delete ID`
`MemberDelete` | `delete MEMBER`
`Binary` | **
`IdentifierAssignment` | `ID ASS_OP EXPR` 
`MemberAssignment` | `MEMBER ASS_OP EXPR`
`IdentifierUpdate` | `++ID | --ID | ID++ | ID--` 
`MemberUpdate` | `++MEMBER | --MEMBER | MEMBER++ | MEMBER--`
`Logical` | **
`Conditional` | **
`New` | **
`MemberCall` | `MEMBER(EXPRS)`
`Call` | EXPR(EXPRS)
`Eval` | `eval(EXPRS)`
`Member` | **
`Identifier` | alias for `Identifier` 
`Literal` | alias for `Literal`

(**): Add `Expression` to the type to obtain the Mozilla alias.

