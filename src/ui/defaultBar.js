export default [
  {
    key: 'bold',
    title: '加粗',
    command: 'bold',
    notice: (vnode) => {
      console.log(111)
      console.log(vnode)
    },
  },
  { key: 'delete', title: '删除', command: 'delete' },
  { key: 'fontSizeAdd', title: '字体变大', command: 'fontSizeAdd' },
  { key: 'custom', title: 'custom', command: 'test' },
]
