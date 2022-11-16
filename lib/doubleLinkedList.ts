export class Node<T> {
  public next: Node<T> | null = null;
  public prev: Node<T> | null = null;

  constructor(
    public data: T,
  ) {
  }
}

export class DoubleLinkedList<T> {
  private size = 0;
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  append(value: T) {
    const node = new Node(value);

    if (this.head === null) {
      this.head = node;

      return;
    }

    let tmp = this.head;

    while (tmp.next !== null) {
      tmp = tmp.next;
    }

    tmp.next = node;
    node.prev = tmp;

    this.size++;
  }

  find(cmp: (val: T) => boolean): Node<T> | null {
    let node = this.head;

    if (node === null) {
      return null;
    }

    if (cmp(node.data)) {
      return node;
    }

    while (node.next !== null) {
      node = node.next;

      if (cmp(node.data)) {
        return node;
      }
    }

    return null;
  }

  print() {
    let node = this.head;

    if (node === null) {
      return;
    }

    while (node.next !== null) {
      console.log(node.data);
      node = node.next;
    }

    // print last node
    console.log(node.data);
  }

  isEmpty() {
    return this.size === 0;
  }
}
