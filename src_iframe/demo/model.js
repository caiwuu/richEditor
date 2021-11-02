data = {
  tag: 'p',
  dom: null,
  parent: null,
  childrens: [
    {
      tag: 'text',
      context: 'hello',
      dom: null,
      parent: null,
    },
    {
      tag: 'span',
      childrens: [
        {
          tag: 'text',
          context: 'word',
          dom: null,
          parent: null,
        },
      ],
      dom: null,
      parent: null,
      style: 'color:red',
    },
  ],
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
