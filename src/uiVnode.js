export const bodyVnode = {
  tag: 'div',
  childrens: [
    {
      tag: 'p',
      childrens: [
        { tag: 'text', context: '普通文字普通文字' },
        {
          tag: 'span',
          childrens: [{ tag: 'text', context: '大号文字大号文字大号文字大号文字大' }],
          style: { color: '#bbb', fontSize: '16px' },
        },
        {
          tag: 'span',
          childrens: [
            {
              tag: 'text',
              context:
                '小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字的文字小号的文字小号的文字小号的文字的文字小号的文字小号的文字',
            },
          ],
          style: { color: '#bbb', fontSize: '10px' },
        },
        // { tag: 'br' },
      ],
      style: { color: '#888' },
    },
    {
      tag: 'ul',
      childrens: [
        {
          tag: 'li',
          childrens: [
            {
              tag: 'span',
              childrens: [{ tag: 'text', context: '加了样式的文字1' }],
            },
            {
              tag: 'span',
              childrens: [{ tag: 'text', context: '加了样式的文字2' }],
            },
          ],
        },
        { tag: 'li', childrens: [{ tag: 'text', context: '12333333' }] },
        { tag: 'li', childrens: [{ tag: 'text', context: '456' }] },
        {
          tag: 'li',
          childrens: [
            {
              tag: 'span',
              childrens: [{ tag: 'text', context: '这是一个pan' }],
            },
          ],
        },
      ],
    },
    {
      tag: 'p',
      childrens: [
        {
          tag: 'text',
          context: 'text after image',
        },
        {
          tag: 'span',
          childrens: [
            {
              tag: 'text',
              context: 'span after image',
            },
            // { tag: 'br' },
          ],
        },
        // { tag: 'text', context: 'caiwu11' },
        {
          tag: 'img',
          attr: {
            width: '100px',
            height: '100px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        {
          tag: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        // { tag: 'text', context: 'caiwu' },
        {
          tag: 'span',
          childrens: [
            {
              tag: 'text',
              context: 'span after image',
            },
          ],
        },
        {
          tag: 'text',
          context:
            'text after imagetext after imagetext after imagetext after imagetext after imagetext after wwwwww wwwwsssssssimwwwwwwwwwwwwwwmagetext after imagetext after image',
        },
      ],
    },
    {
      tag: 'p',
      childrens: [
        {
          tag: 'a',
          attr: {
            href: 'https://www.baidu.com',
          },
          childrens: [{ tag: 'text', context: '百度链接' }],
        },
      ],
    },
    {
      tag: 'p',
      style: { background: '#eee' },
      childrens: [
        { tag: 'text', context: '' },
        { tag: 'br', virtual: true },
      ],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}
export const operBarVnode = {
  tag: 'div',
  style: { width: '100%', height: '30px', background: '#ddd', lineHeight: '30px' },
  childrens: [
    {
      tag: 'span',
      childrens: [{ tag: 'text', context: '| 加粗 | ' }],
      style: { cursor: 'pointer' },
    },
    {
      tag: 'span',
      childrens: [{ tag: 'text', context: ' 字体变大 | ' }],
      style: { cursor: 'pointer' },
    },
    {
      tag: 'span',
      childrens: [{ tag: 'text', context: ' 字体减小 | ' }],
      style: { cursor: 'pointer' },
    },
  ],
}
