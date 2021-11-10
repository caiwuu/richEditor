data = {
  tag: 'div',
  childrens: [
    {
      tag: 'p',
      childrens: [
        { tag: 'text', context: '普通文字' },
        {
          tag: 'span',
          childrens: [{ tag: 'text', context: '加了样式的文字' }],
          style: { color: 'red', fontSize: '36px' },
        },
      ],
      style: { color: '#888' },
    },
    {
      tag: 'ul',
      childrens: [{ tag: 'li', childrens: [{ tag: 'text', context: '123' }] }],
    },
  ],
  attr: { id: 'editor-body', contenteditable: true },
};

function createDom(data, parent) {
  let dom = null;
  data.parent = parent;
  if (data.tag !== 'text') {
    dom = document.createElement(data.tag);
    dom.model = data;
    data.dom = dom;
    data.childrens.forEach((element) => {
      dom.appendChild(createDom(element, data));
    });
  } else {
    dom = document.createTextNode(data.context);
    dom.model = data;
    data.dom = dom;
  }
  return dom;
}

let d = createDom(data);
d.childNodes[0].model.context = 'ggggg';
console.log(data);
