export class FlowerSelection {
  constructor() {
    this.selected = new Set();
  }
  toggle(name) {
    if (this.selected.has(name)) this.selected.delete(name);
    else if (this.selected.size < 3) this.selected.add(name);
    return this.ready;
  }
  get ready() {
    return this.selected.size === 3;
  }
}
