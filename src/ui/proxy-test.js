let data = {
  cdata: {
    ccdata: {
      name: 'hhha',
    },
  },
  name: 'sss',
  list: [{ aa: 22 }],
}
let handle = {
  set(target, key, newValue) {
    console.log(target, key, newValue)
    Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    if (key === 'remove') {
      return function () {
        console.log('remove')
      }
    }
    console.log(22)
    return Reflect.get(target, key)
  },
}
function setProxy(target, handle) {
  for (const key in target) {
    if (target.hasOwnProperty.call(target, key)) {
      const element = target[key]
      if (typeof element === 'object') {
        target[key] = setProxy(element, handle)
      }
    }
  }
  return new Proxy(target, handle)
}
let pdata = setProxy(data, handle)
console.log(pdata.list.length)
