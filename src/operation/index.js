import vt from './vnodeTool'
const operation = {
  del({ startPos, startOffset, endPos, endOffset, range }) {
    if (range) {
      if (range.collapsed) {
        if (endOffset) {
          vt(range.endContainer.vnode).from(endOffset).del(1)
          if (range.endContainer.vnode.tag === 'text') {
            range.setStart(range.endContainer, startOffset)
            range.updateCaret(true)
          }
        } else {
        }
      }
    }
  },
}

export default function exec(op) {
  operation[op.type](op)
}
