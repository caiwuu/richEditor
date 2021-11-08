export default class Selection {
  selection = null;
  constructor() {
    this.selection = document.getSelection();
  }
  getRange() {
    return this.selection.getRangeAt(0);
  }
  removeAllRanges() {
    this.selection.removeAllRanges();
  }
  addRange(range) {
    this.selection.addRange(range);
  }
}
