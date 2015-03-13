
var Assert = require("assert")
var Esvisit = require("..")
var Esprima = require("esprima")

describe("type", function (){

  it("should stack node type for '1+2;'", function (done) {
    var code = "1+2"
    var ast = Esprima.parse("1+2;")
    var types = []
    function push (type) { types.push(type) }
    Esvisit.Visit(ast, push, push)
    Assert.deepEqual(types, ["Expression", "Binary", "Literal", "Literal"])
    done()
  })

})
