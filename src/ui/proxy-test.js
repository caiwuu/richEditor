let data = {
  cdata: {
    ccdata: {
      name: 'hhha',
    },
  },
  name: 'sss',
}
let handle = {
  set: (target, key, newValue) => {
    console.log(target, key, newValue)
    Reflect(target, key, newValue)
  },
}
function setProxy(target, handle) {
  for (const key in target) {
    if (target.hasOwnProperty.call(target, key)) {
      const element = target[key]
      if (typeof element === 'object') {
        return setProxy(element, handle)
      } else {
        return element
      }
    }
  }
  return new Proxy(target, handle)
}
let pdata = setProxy(data, handle)
