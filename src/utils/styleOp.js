export function styleSet(dom, style) {
  for (const key in style) {
    dom.style[key] = style[key]
  }
}
