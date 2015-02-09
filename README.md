# esvisit

Esvisit is simple a npm module for visiting JavaScript abstract syntax trees that are compatible with the Mozilla parser API as described in https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Programs.
This module support exclusvely ECMAScript5 as described in http://www.ecma-international.org/ecma-262/5.1/.
Benfits of using Esvisit include:
* Process iteratively and avoid recursion.
* Get an alternative type that better reflect the JavaScript semantic.
* Visit only actual statements and expressions.

For instance the statement `o.a(1);` will trigger the below visits:
1. `Expression`: The whole statement expression `o.a(1);`.
2. `MemberCall`: The member call: `o.a(1)`. 
3. `Identifier`; the object callee (thisArgument): `o`.
4. `Literal`; the unique argument: `1`.

## Demonstration

```javascript
var Esvisit = require('esvisit');
var Esprima = require('esprima');

var code = 'var x = 1;' // Your JS code here...
var ast = Esprima.parse(code)

var counter = 0;
function visitStatement (type, stmt, ondone) { visit('statement', type, stmt, ondone) }
function visitExpression (type, expr, ondone) { visit('expression', type, expr, ondone) }
function visit (kind, type, node, ondone) {
  var id = ++counter;
  console.log('Begin '+kind+': '+type+' (nodeID: '+id+')')
  ondone(function () { console.log('End '+kind+': '+type+' (nodeID: '+id+')') })
}

Esvisit(ast, visitStatement, visitExpression)
```

## Statement Types

Type | Interpretation
:----|:--------------
`Empty` |
`Block` |
`Expression` |
`If` |
`Labeled` |
`Break` |
`Continue` |
`With` |
`Switch` |
`Return` |
`Throw` |
`Try` |
`While` |
`DoWhile` |
`For` | `for (EXPR; EXPR; EXPR) STMT`
`DeclarationFor` | `for (VAR_DECL; EXPR; EXPR) STMT`
`IdentifierForIn` | `for (ID in EXPR) STMT`
`MemberForIn` | `for (MEMBER in EXPR) STMT`
`DeclarationForIn` | `for (var ID [=EXPR] in EXPR) STMT`
`Function` | alias for `FunctionDeclaration`
`Variable` | alias for `VariableDeclaration`

## Expression Types

Type | Interpretation
:----|:--------------
`This` |
`Array` |
`Object` |
`Function` |
`Sequence` |
`Unary` |
`IdentifierTypeof` | `typeof ID`
`IdentifierDelete` | `delete ID`
`MemberDelete` | `delete MEMBER`
`Binary` |
`IdentifierAssignment` | `ID ASS_OP EXPR` 
`MemberAssignment` | `MEMBER ASS_OP EXPR`
`IdentifierUpdate` | `++ID | --ID | ID++ | ID--` 
`MemberUpdate` | `++MEMBER | --MEMBER | MEMBER++ | MEMBER--`
`Logical` |
`Conditional` |
`New` |
`MemberCall` | `MEMBER(EXPRS)`
`Call` | EXPR(EXPRS)
`Eval` | `eval(EXPRS)`
`Member` |
`Identifier` | alias for `Identifier` 
`Literal` | alias for `Literal`
