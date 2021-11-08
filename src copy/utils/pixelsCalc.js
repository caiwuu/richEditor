export function multiplication(pxVal, times) {
  return pxVal.replace(/(.*)(px)+/, function ($0, $1) {
    return $1 * times + 'px';
  });
}
