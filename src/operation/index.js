import vt from './vnodeTool'
// import { getNode } from '../utils'
const operation = {
  del({ startPos, startOffset, endPos, endOffset, rootTree }) {
    if (startPos === endPos) {
      if (endOffset) {
        vt(endPos).from(endOffset).del(1)
      } else {
        log('!!!')
      }
    }
  },
}

export default function exec(op) {
  operation[op.type](op)
}
