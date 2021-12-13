export default {
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
