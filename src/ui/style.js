import('./css.css')
export default function initStyle(id) {
  const style = `
  #${id} .bold {
    font-weight: bold;
  }
  #${id} .italic {
    font-style: italic;
  }
  
  #${id} .h1 {
    font-size: 2em;
    margin: 0.67em 0;
  }
  #${id} .h2 {
    font-size: 1.5em;
    margin: 0.75em 0;
  }
  #${id} .h3 {
    font-size: 1.17em;
    margin: 0.83em 0;
  }
  #${id} .h5 {
    font-size: 0.83em;
    margin: 1.5em 0;
  }
  #${id} .h6 {
    font-size: 0.75em;
    margin: 1.67em 0;
  }
`
  const link = document.createElement('style')
  link.innerHTML = style
  document.head.appendChild(link)
}
