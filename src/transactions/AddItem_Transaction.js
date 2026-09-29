/**
 * AddItem_Transaction.js
 *
 * The jsTPS library employs the Command design pattern, and each transaction,
 * including this one, is used as a command: an undoable action packaged as an
 * object with doTransaction() and undoTransaction().
 *
 * Adds one item to the open list, and knows how to take it back out again.
 *
 * The item itself is built once, by whoever constructed this transaction, and
 * then held onto. That matters: if we manufactured a new item every time
 * doTransaction ran, then undo followed by redo would leave a different object,
 * with a different id, sitting in the list.
 */
import { jsTPS_Transaction } from '../lib/jsTPS.js';

export class AddItem_Transaction extends jsTPS_Transaction {
    #operations;
    #item;
    #index;

    /**
     * @param {Object} operations the list operations handed out by CurrentListContext
     * @param {Object} item the item to add
     * @param {number} index where it goes
     */
    constructor(operations, item, index) {
        super();
        this.#operations = operations;
        this.#item = item;
        this.#index = index;
    }

    doTransaction() {
        this.#operations.addItem(this.#item, this.#index);
    }

    undoTransaction() {
        this.#operations.removeItemAt(this.#index);
    }

    toString() {
        return `AddItem_Transaction(index ${this.#index})`;
    }
}
