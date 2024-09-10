import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 双链表
 */


class Item<T> {
    data: T;
    next: Item<T> | null = null;
    prev: Item<T> | null = null;
    constructor(data: T) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

@ccclass('DoublyLinkedList')
export class DoublyLinkedList<T> {
    private head: Item<T> | null;
    private tail: Item<T> | null;

    constructor() {
        this.head = null;
        this.tail = null;
    }

    // 添加到末位元素
    private addItem(data: T) {
        let newItem = new Item(data);
        if (this.head) {
            newItem.prev = this.tail;
            this.tail.next = newItem;
            this.tail = newItem;
        } else {
            this.head = newItem;
            this.tail = newItem;
        }
    }

    // 添加到首位元素
    private addFristItem(data: T) {
        let newItem = new Item(data);
        if (this.head) {
            this.head.prev = newItem;
            newItem.next = this.head;
            this.head = newItem;
        } else {
            this.head = newItem;
            this.tail = newItem;
        }
    }

    private addNoFixItem(data: T, position: number = -1) {
        let newItem = new Item(data);
        if (this.head) {
            var index = 0;
            var current = this.head;
            while (index++ < position) {
                current = current.next;
            }
            newItem.next = current;
            newItem.prev = current.prev;
            current.prev.next = newItem;
            current.prev = newItem;
        } else {
            this.head = newItem;
            this.tail = newItem;
        }
    }
    // 添加到下标位置元素
    public addItemPos(data: T, position: number = -1) {
        if (position > this.length||position <-1) {
            console.error("插入数据失败", data, position);
            return;
        }
        if (position === -1 || position === this.length) {
            this.addItem(data);
        } else if (position === 0) {
            this.addFristItem(data);
        } else {
            this.addNoFixItem(data, position)
        }
    }

    // 删除元素
    deleteItem(data: T) {
        let currentItem = this.head;
        while (currentItem) {
            if (currentItem.data == data) {
                if (currentItem == this.head && currentItem == this.tail) {
                    this.head = null;
                    this.tail = null;
                } else if (currentItem == this.head) {
                    this.head = currentItem.next;
                    this.head.prev = null;
                } else if (currentItem == this.tail) {
                    this.tail = currentItem.prev;
                    this.tail.next = null;
                } else {
                    currentItem.prev.next = currentItem.next;
                    currentItem.next.prev = currentItem.prev;
                }
            }
            currentItem = currentItem.next;
        }
    }

    clear(): void { 
        this.head = null;
        this.tail = null;
    }
    // 获取元素
    getItem(index: number): T | null {
        let currentItem = this.head;
        let count = 0;
        while (currentItem) {
            if (count == index) {
                return currentItem.data;
            }
            count++;
            currentItem = currentItem.next;
        }
        return null;
    }

    // 更新元素
    updateItem(index: number, newData: T) {
        let currentItem = this.head;
        let count = 0;
        while (currentItem) {
            if (count == index) {
                currentItem.data = newData;
                return;
            }
            count++;
            currentItem = currentItem.next;
        }
    }

    // 获取长度
    get length(): number {
        let currentItem = this.head
        let length = 0;
        while (currentItem) {
            length++;
            currentItem = currentItem.next;
        }
        return length;
    }
}


