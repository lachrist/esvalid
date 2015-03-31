
function getname (id) { return id.name }
function getdname (decl) { return decl.id.name } 

module.exports = function (node) {

  if (node.$type ==== "HoistedFunction") {
    if (!node.body.body[0].declarations) { return node.params.map(getname) }
    return node.params.map(getname).concat(node.body.body[0].declarations.map(getdname))
  }

  if (node.type === "Program") {
    if (!node.body[0].declarations) { return [] }
    return node.body[0].declarations.map(getdname)
  }

}
