export class Queue<T> {
  private elements: T[] = [];

  get size(): number {
    return this.elements.length;
  }

  isEmpty() {
    return this.size === 0;
  }

  enqueue(el: T) {
    this.elements.push(el);
  }

  peek(): T {
    return this.elements[this.size - 1];
  }

  dequeue(): T | null {
    return this.elements.shift() || null;
  }

  find(cmp: (val: T) => boolean): T | null {
    return this.elements.find(val => cmp(val)) || null;
  }

  filter(cmp: (val: T) => boolean) {
    return this.elements.filter(val => cmp(val));
  }

  clearBy(cmp: (val: T) => boolean) {
    this.elements = this.elements.filter((val) => cmp(val));
  }

  putAtStart(el: T) {
    this.elements = [el].concat(this.elements);
  }
}
