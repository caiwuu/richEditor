import { styleSet, attrSet } from '../utils/domOp';
function createVnode(vnode, parent) {
  if (!vnode.tag) throw 'arguments vnode.tag is required';
  let dom = null;
  vnode.parent = parent;
  if (vnode.tag !== 'text' && vnode.tag !== 'br') {
    dom = document.createElement(vnode.tag);
    dom.model = vnode;
    vnode.dom = dom;
    vnode.childrens.forEach((element) => {
      dom.appendChild(createVnode(element, vnode));
    });
  } else {
    dom = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag);
    dom.model = vnode;
    vnode.dom = dom;
  }
  if (vnode.style) styleSet(dom, vnode.style);
  if (vnode.attr) attrSet(dom, vnode.attr);
  return dom;
}

export default class VNode {
  VNodeTree;
  init(vnode) {
    this.VNodeTree = vnode;
    return createVnode(vnode, null);
  }
}
