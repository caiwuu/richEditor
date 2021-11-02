// 实验性代码，方案验证
import Cursor from './cursor';
import state from './state/';
let timmer = null;
// 获取输入区域dom 暂时写死一个
const Document = window.iframe.contentDocument;

const htmlstr = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 50px;
        overflow-x: hidden;
      }
      #editor-body {
        caret-color: red;
      }
      #editor-body:focus,
      #custom-input:focus {
        outline: none;
      }
      #custom-caret,
      #custom-input {
        top: -100px;
        left: 0;
        position: absolute;
        width: 2px;
        background: transparent;
        border: none;
        padding: 0;
      }
      #custom-measure {
        display: inline-block;
        position: fixed;
        left: 0;
        bottom: -100px;
        color: transparent;
      }
      #custom-input {
        opacity: 1;
        caret-color: transparent;
        color: transparent;
      }
      #custom-caret {
        display: block;
        animation: caret 1s infinite steps(1, start);
      }
      @keyframes static-caret {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 1;
        }
      }
      @keyframes caret {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
      ::selection
      {
      background:rgba(20,150,220,0.2)
      }
    </style>
  </head>
  <body>
    <div id="editor-body">
      <span uuid="000001"
        >我是&nbsp;&nbsp;&nbsp;&nbsp;一个DIV元素,<span style="color: blueviolet; font-size: 36px">123abc测<br>试文本</span>*!@#$%^&*()_+-</span
        >但是我是可编辑的</span
      >
      <p>这是一个段落</p>
      <td>
        <ul>
          <li>111</li>
          <li>222</li>
        </ul>
      </td>
      <p><img src="https://gitee.com/caiwu123/pic/raw/master/image-20211007025134178.png" alt="image-20211007025134178" /></p>
      <div>DIV</div>
    </div>
    <input type="text" name="" id="" />
    <iframe id="iframe" src="" frameborder="0">
      111
    </iframe>
  </body>
</html>

`;
// window.iframe.contentDocument.body.appendChild(document.createTextNode('sssssssssssssssss'));
window.iframe.contentDocument.write(htmlstr);

const input = Document.querySelector('#editor-body');
input.setAttribute('contenteditable', true);
const cursor = new Cursor();
cursor.input.onblur = function () {
  cursor.caret.style.display = 'none';
};
input.onmousedown = function () {
  cursor.show();
  state.selectState = 'release';
  state.selecting = false;
  if (timmer) {
    clearTimeout(timmer);
  }
  timmer = setTimeout(() => {
    cursor.caret.style.animationName = 'caret';
  }, 1000);
  setTimeout(() => {
    cursor.caret.style.animationName = 'caret-static';
    cursor.followSysCaret();
  });
};
input.oninput = function (e) {
  console.log('input');
  e.preventDefault();
};
input.onmousemove = function () {
  if (timmer) {
    clearTimeout(timmer);
  }
  timmer = setTimeout(() => {
    cursor.caret.style.animationName = 'caret';
  }, 1000);
  if (state.mouseState === 'down') {
    state.selectState = 'selecting';
  }
  if (state.selectState === 'selecting' && cursor.isShow) {
    cursor.hidden();
  }
};
input.onmouseup = function () {
  cursor.show();
  state.mouseState = 'up';
  state.selectState = 'selected';
  setTimeout(() => {
    cursor.caret.style.animationName = 'caret-static';
    cursor.followSysCaret();
    cursor.focus();
  });
};
document.onkeydown = function () {
  input.focus();
};
// Document.onkeydown = grabEvent;
function grabEvent(event) {
  // Document.focus();
  // window.iframe.focus();
  console.log(11);
  state.keyboard = event.key;
  const key = event.key;
  cursor.caret.style.animationName = 'caret-static';
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
      if (document.activeElement.id !== 'custom-input') {
        // 焦点恢复到内容区域以便于使用光标系统
        const { selection, range, text, offset } = cursor.meta;
        range.setStart(text, offset);
        range.setEnd(text, offset);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log(cursor.meta);
        setTimeout(() => {
          console.log(2222222);
          cursor.followSysCaret();
          cursor.focus();
        });
      }
  }
}
Document.onkeyup = function (event) {
  if (timmer) {
    clearTimeout(timmer);
  }
  timmer = setTimeout(() => {
    cursor.caret.style.animationName = 'caret';
  }, 1000);
  // switch (key) {
  //   case 'ArrowUp':
  //   case 'ArrowLeft':
  //   case 'ArrowRight':
  //   case 'ArrowDown':
  //     // case 'Backspace':
  //     // 焦点恢复到 自定义光标上（input）
  //     cursor.followSysCaret();
  //     cursor.focus();
  // }
};
