
module.exports = function (node) { return view(0, null, node) }

function view (depth, property, x) {
  var indent = Array(depth+1).join("  ")
  if (property) { indent = indent+property+" -> " }
  if (Array.isArray(x)) { return indent+"Array:\n"+x.map(view.bind(null, depth+1, null)).join("") }
  if (x&&x.type) {
    var res = indent+x.type+":\n"
    var ks = Object.keys(x)
    for (var i=0; i<ks.length; i++) {
      if ((ks[i][0]!=="$") && (ks[i]!=="type") && (ks[i]!=="loc") && (ks[i]!=="range")) {
        res = res+view(depth+1, ks[i], x[ks[i]])
      }
    }
    return res
  }
  return indent+String(x)+"\n"
}
