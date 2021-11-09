import mitt from 'mitt';
import { createVnode } from '../vnode';
const actions = {
  test: (e) => console.log('foo', e),
  del: (vm) => {
    const { range, end, selection } = vm.cursor.meta;
    // 直接操作
    // range.endContainer.data = range.endContainer.data.slice(0, end - 1) + range.endContainer.data.slice(end);
    // vm.cursor.setSysCaret(-1);
    // vm.cursor.followSysCaret();
    // vm.cursor.focus();
    // MVC
    console.log(range.endContainer.parentNode);
    let orgText = range.endContainer.model.context;
    // orgText = orgText.slice(0, end - 1) + orgText.slice(end);
    orgText = orgText.slice(0, end - 1);
    range.endContainer.model.context = orgText;
    const dom = createVnode(range.endContainer.model);
    range.endContainer.parentNode.replaceChild(dom, range.endContainer);

    range.setStart(dom, end - 1);
    range.setEnd(dom, end - 1);
    selection.removeAllRanges();
    selection.addRange(range);

    vm.cursor.followSysCaret();
    vm.cursor.focus();
  },
};

const emitter = mitt();
for (const key in actions) {
  emitter.on(key, actions[key]);
}

export default emitter;
