// l < r 表示 r节点在 l 之后
export default function compare(l, r) {
  arrL = l.split('-');
  arrR = r.split('-');
  let flag = false;
  minLen = Math.min(arrL.length, arrR.length);
  for (let index = 0; index < minLen; index++) {
    console.log(arrL[index], arrR[index]);
    if (arrL[index] !== arrR[index]) {
      flag = arrL[index] < arrR[index];
      break;
    }
  }
  return flag;
}
