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
