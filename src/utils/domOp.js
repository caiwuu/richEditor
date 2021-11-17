export function styleSet(dom, style) {
  for (const key in style) {
    dom.style[key] = style[key];
  }
}
export function attrSet(dom, attr) {
  for (const key in attr) {
    dom.setAttribute(key, attr[key]);
  }
}
export function clonePlainVnode(vnode) {
  const cloneVnode = {};
  cloneVnode.tag = vnode.tag;
  cloneVnode.position = vnode.position;
  vnode.context && (cloneVnode.context = vnode.context);
  vnode.style && (cloneVnode.style = { ...vnode.style });
  vnode.attr && (cloneVnode.attr = { ...vnode.attr });
  vnode.childrens && (cloneVnode.childrens = vnode.childrens.map((i) => clonePlainVnode(i)));
  return cloneVnode;
}
