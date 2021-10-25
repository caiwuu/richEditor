export default function (inputId, selectionPoint, e) {
  const input = document.getElementById(inputId)
  const { offsetLeft: inputX, offsetTop: inputY } = input
  // const div = document.createElement('div')
  // const copyStyle = getComputedStyle(input)
  // for (const prop of copyStyle) {
  //   div.style[prop] = copyStyle[prop]
  // }
  const div = input.cloneNode(true)
  div.style.position = 'absolute'
  div.style.whiteSpace = 'nowrap'
  div.style.top = '0'
  div.style.left = '10000px'

  const swap = '.'

  console.log(e.target.offsetHeight)
  const inputValue = input.innerText.replace(/ /g, swap)
  const l = inputValue.substr(0, selectionPoint)
  div.textContent = l
  const span = document.createElement('span')
  const text = document.createElement('text')
  const r = inputValue.substr(selectionPoint) || '.'
  span.textContent = '.'
  text.textContent = r
  div.appendChild(span)
  div.appendChild(text)
  document.body.appendChild(div)
  const { offsetLeft: spanX, offsetTop: spanY } = span

  const x = inputX + spanX,
    y = inputY + spanY
  const pointer = document.createElement('input')
  console.log(x, y)
  pointer.id = 'pointer'
  pointer.style.top = y + 2 + 'px'
  pointer.style.left = x - 1 + 'px'
  document.body.appendChild(pointer)

  pointer.focus()
  div.removeChild(span)
  // return {
  //   x: inputX + spanX,
  //   y: inputY + spanY,
  // }
}
