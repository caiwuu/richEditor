export const bodyVnode = {
  type: 'div',
  childrens: [
    {
      type: 'p',
      childrens: [
        { type: 'text', context: '普通文字1' },
        { type: 'text', context: '普通文字2' },
        {
          type: 'span',
          childrens: [{ type: 'text', context: '大号文字大号文字大号文字大号文字大' }],
          style: { color: '#bbb', fontSize: '16px' },
        },
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context:
                '小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字小号的文字的文字小号的文字小号的文字小号的文字的文字小号的文字小号的文字',
            },
          ],
          style: { color: '#bbb', fontSize: '10px' },
        },
        // { type: 'br' },
      ],
      style: { color: '#888' },
    },
    {
      type: 'ul',
      childrens: [
        {
          type: 'li',
          childrens: [
            {
              type: 'span',
              childrens: [{ type: 'text', context: '加了样式的文字1' }],
            },
            {
              type: 'span',
              childrens: [{ type: 'text', context: '加了样式的文字2' }],
            },
          ],
        },
        { type: 'li', childrens: [{ type: 'text', context: '12333333' }] },
        { type: 'li', childrens: [{ type: 'text', context: '456' }] },
        {
          type: 'li',
          childrens: [
            {
              type: 'span',
              childrens: [{ type: 'text', context: '这是一个pan' }],
            },
          ],
        },
      ],
    },
    {
      type: 'p',
      childrens: [
        {
          type: 'text',
          context: 'text after image',
        },
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context: 'span after image',
            },
            // { type: 'br' },
          ],
        },
        // { type: 'text', context: 'caiwu11' },
        {
          type: 'img',
          attr: {
            width: '300px',
            height: '100px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        {
          type: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        { type: 'text', context: 'caiwu' },
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context: 'span after image',
            },
          ],
        },
        {
          type: 'text',
          context:
            'text after imagetext after imagetext after imagetext after imagetext after imagetext after wwwwww wwwwsssssssimwwwwwwwwwwwwwwmagetext after imagetext after image',
        },
      ],
    },
    {
      type: 'p',
      childrens: [
        {
          type: 'a',
          attr: {
            href: 'https://www.baidu.com',
            class: 'italic',
          },
          childrens: [{ type: 'text', context: '百度链接' }],
        },
      ],
    },
    {
      type: 'p',
      style: { background: 'rgb(255 234 206)' },
      childrens: [
        { type: 'text', context: '' },
        { type: 'br', virtual: true },
      ],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}
export const operBarVnode = {
  type: 'div',
  style: { width: '100%', height: '30px', background: '#ddd', lineHeight: '30px' },
  childrens: [
    {
      type: 'span',
      childrens: [{ type: 'text', context: '| 加粗 | ' }],
      style: { cursor: 'pointer' },
    },
    {
      type: 'span',
      childrens: [{ type: 'text', context: ' 字体变大 | ' }],
      style: { cursor: 'pointer' },
    },
    {
      type: 'span',
      childrens: [{ type: 'text', context: ' 字体减小 | ' }],
      style: { cursor: 'pointer' },
    },
  ],
}
