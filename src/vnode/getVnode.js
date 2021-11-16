export default function getVnode(rootTree, position) {
  console.log(rootTree)
  const recursionTree = {
    childrens: [rootTree],
  }
  return position.split('-').reduce((pre, cur) => {
    return pre.childrens[cur]
  }, recursionTree)
}
