const data1 = {
  type: 'div',
  childrens: [
    { type: 'p', childrens: [{ type: 'span', attr: { class: 'h4' }, childrens: [{ type: 'text', context: '段落测试：' }] }] },
    {
      type: 'p',
      childrens: [
        { type: 'text', context: '普通文本' },
        {
          type: 'span',
          childrens: [{ type: 'text', context: 'span包裹带样式的文本' }],
          style: { color: '#aa7700', fontSize: '18px' },
        },
        {
          type: 'text',
          context:
            '长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本长文本',
        },
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
              childrens: [{ type: 'text', context: 'span列表内容1' }],
            },
          ],
        },
        { type: 'li', childrens: [{ type: 'text', context: '列表内容2' }] },
        {
          type: 'li',
          childrens: [
            {
              type: 'span',
              childrens: [{ type: 'text', context: 'span列表内容3' }],
            },
          ],
        },
      ],
    },
    {
      type: 'p',
      childrens: [
        {
          type: 'img',
          attr: {
            width: '300px',
            height: '100px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
      ],
    },
    {
      type: 'p',
      childrens: [
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
      ],
    },
    {
      type: 'p',
      childrens: [
        { type: 'text', context: '图片之前的普通文本' },
        {
          type: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
      ],
    },
    {
      type: 'p',
      childrens: [
        { type: 'span', childrens: [{ type: 'text', context: '图片之前的span文本' }] },
        {
          type: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
      ],
    },
    {
      type: 'p',
      childrens: [
        {
          type: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        { type: 'text', context: '图片之后的普通文本' },
      ],
    },
    {
      type: 'p',
      childrens: [
        {
          type: 'img',
          attr: {
            width: '50px',
            height: '50px',
            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
          },
        },
        // { type: 'span', childrens: [{ type: 'text', context: '图片之后的span文本' }] },
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
          childrens: [{ type: 'text', context: '百度链接2' }],
        },
        { type: 'text', context: '普通文本' },
        {
          type: 'a',
          attr: {
            href: 'https://www.baidu.com',
            class: 'italic',
          },
          childrens: [{ type: 'text', context: '百度链接2' }],
        },
        { type: 'text', context: '普通文本' },
      ],
    },
    {
      type: 'p',
      style: { background: 'rgb(255 234 206)' },
      childrens: [{ type: 'br', kind: 'placeholder' }],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}

const data2 = {
  type: 'div',
  childrens: [
    {
      type: 'p',
      childrens: [
        { type: 'text', context: '普通文字1' },
        { type: 'text', context: '普通文字1' },
        // { type: 'br' },
        {
          type: 'span',
          childrens: [
            { type: 'text', context: '普通文字1' },
            // { type: 'br', kind: 'placeholder' },
          ],
        },
      ],
      style: { color: '#888' },
    },
    {
      type: 'p',
      childrens: [{ type: 'text', context: '普通文字2' }],
      style: { color: '#888' },
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}

const data3 = {
  type: 'div',
  childrens: [
    {
      type: 'div',
      childrens: [
        {
          type: 'div',
          childrens: [
            {
              type: 'p',
              childrens: [
                { type: 'text', context: '111' },
                { type: 'text', context: '' },
              ],
            },
            // {
            //   type: 'p',
            //   childrens: [],
            // },
            // {
            //   type: 'p',
            //   childrens: [{ type: 'text', context: '普通文字4' }],
            // },
            // {
            //   type: 'span',
            //   childrens: [
            //     { type: 'text', context: '1' },
            //     {
            //       type: 'compontent',
            //       render: () => {
            //         const div = document.createElement('span')
            //         const text = document.createTextNode('wwwwwwwww')
            //         div.appendChild(text)
            //         return div
            //       },
            //       kind: 'placeholder',
            //     },
            //   ],
            // },
          ],
        },
        {
          type: 'p',
          childrens: [
            { type: 'text', context: '普通文字1' },
            { type: 'text', context: 'sssss' },
            {
              type: 'span',
              childrens: [
                {
                  type: 'img',
                  attr: {
                    width: '300px',
                    height: '100px',
                    src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fyouimg1.c-ctrip.com%2Ftarget%2F01057120008iz023cA34F_R_230_160.jpg%3Fproc%3Dautoorient&refer=http%3A%2F%2Fyouimg1.c-ctrip.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1640885960&t=a5002259f8e1e98beeb841eed0fddd3f',
                  },
                },
              ],
            },
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
          ],
        },
        { type: 'p', childrens: [{ type: 'text', context: '普通文字222' }] },
        {
          type: 'div',
          childrens: [
            {
              type: 'p',
              childrens: [
                { type: 'span', childrens: [{ type: 'text', context: '普通文字6' }] },
                { type: 'text', context: '普通文字6' },
                { type: 'span', childrens: [{ type: 'text', context: '普通文字6' }] },
              ],
            },
          ],
        },
      ],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}

const data4 = {
  type: 'div',
  childrens: [
    {
      type: 'p',
      childrens: [
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context: '内容1',
            },
          ],
        },
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context: '内容2',
            },
          ],
        },
        {
          type: 'span',
          childrens: [
            {
              type: 'text',
              context: '内容3',
            },
          ],
        },
      ],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}

const data5 = {
  type: 'div',
  childrens: [
    {
      type: 'p',
      childrens: [
        {
          type: 'span',
          childrens: [],
        },
      ],
    },
  ],
  attr: {
    id: 'editor-body',
  },
  style: { minHeight: '200px', whiteSpace: 'normal', wordBreak: 'break-all' },
}
export default data1
