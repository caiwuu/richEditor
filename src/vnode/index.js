import { styleSet, attrSet } from '../utils/domOp';
function createVnode(vnode, parent = null, position = 0) {
  if (!vnode.tag) throw 'arguments vnode.tag is required';
  let dom = null;
  vnode.parent = parent;
  vnode.position = parent ? parent.position + '-' + position : position;
  if (vnode.tag !== 'text' && vnode.tag !== 'br') {
    dom = document.createElement(vnode.tag);
    dom.vnode = vnode;
    vnode.dom = dom;
    vnode.childrens &&
      vnode.childrens.forEach((element, index) => {
        dom.appendChild(createVnode(element, vnode, index));
      });
  } else {
    dom = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag);
    dom.vnode = vnode;
    vnode.dom = dom;
  }
  if (vnode.style) styleSet(dom, vnode.style);
  if (vnode.attr) attrSet(dom, vnode.attr);
  return dom;
}

export { createVnode };
export default class VNode {
  VNodeTree;
  dom;
  rootId;
  constructor(vnode) {
    this.VNodeTree = vnode;
    this.dom = createVnode(vnode, null);
  }
  mount(id) {
    this.rootId = id;
    return document.getElementById(id).appendChild(this.dom);
  }
  update(vnode) {
    this.VNodeTree = vnode;
    this.dom = createVnode(vnode, null);
    this.mount(this.rootId);
  }
}
