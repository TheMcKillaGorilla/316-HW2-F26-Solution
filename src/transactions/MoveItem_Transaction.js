/**
 * MoveItem_Transaction.js
 *
 * The jsTPS library employs the Command design pattern, and each transaction,
 * including this one, is used as a command: an undoable action packaged as an
 * object with doTransaction() and undoTransaction().
 *
 * Records one drag and drop reordering.
 *
 * This is the shortest transaction in the application, for the same reason it was
 * in HW1: moveItem is its own inverse. Pulling an item out of position 5 and
 * inserting it at position 2 is undone by pulling it out of position 2 and
 * inserting it back at position 5. Nothing is lost by a move, so the two indices
 * are all it needs to remember.
 */
import { jsTPS_Transaction } from '../lib/jsTPS.js';

export class MoveItem_Transaction extends jsTPS_Transaction {
    #operations;
    #fromIndex;
    #toIndex;

    /**
     * @param {Object} operations the list operations handed out by CurrentListContext
     * @param {number} fromIndex where the item was picked up
     * @param {number} toIndex where it was dropped
     */
    constructor(operations, fromIndex, toIndex) {
        super();
        this.#operations = operations;
        this.#fromIndex = fromIndex;
        this.#toIndex = toIndex;
    }

    doTransaction() {
        this.#operations.moveItem(this.#fromIndex, this.#toIndex);
    }

    undoTransaction() {
        this.#operations.moveItem(this.#toIndex, this.#fromIndex);
    }

    toString() {
        return `MoveItem_Transaction(${this.#fromIndex} to ${this.#toIndex})`;
    }
}
