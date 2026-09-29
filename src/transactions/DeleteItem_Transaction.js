/**
 * DeleteItem_Transaction.js
 *
 * The jsTPS library employs the Command design pattern, and each transaction,
 * including this one, is used as a command: an undoable action packaged as an
 * object with doTransaction() and undoTransaction().
 *
 * Removes one item from the open list, and knows how to put it back exactly where
 * it was.
 *
 * Undo cannot recreate a deleted item out of thin air, so this transaction is
 * handed the item at the moment it is built and keeps it for as long as it
 * lives. Redo then hands that very same object back, which is why the item's id
 * survives any number of undo/redo cycles.
 *
 * Compare this with HW1, where the item was captured inside doTransaction as the
 * return value of the model's removeItemFromCurrentList. That worked because the
 * model was there to be asked. Here the transaction cannot ask anybody anything
 * once it is running, so everything it will ever need arrives through the
 * constructor.
 */
import { jsTPS_Transaction } from '../lib/jsTPS.js';

export class DeleteItem_Transaction extends jsTPS_Transaction {
    #operations;
    #index;
    #deletedItem;

    /**
     * @param {Object} operations the list operations handed out by CurrentListContext
     * @param {number} index which item to delete
     * @param {Object} deletedItem the item that sits at that index right now
     */
    constructor(operations, index, deletedItem) {
        super();
        this.#operations = operations;
        this.#index = index;
        this.#deletedItem = deletedItem;
    }

    doTransaction() {
        this.#operations.removeItemAt(this.#index);
    }

    undoTransaction() {
        if (!this.#deletedItem) return;
        this.#operations.addItem(this.#deletedItem, this.#index);
    }

    toString() {
        return `DeleteItem_Transaction(index ${this.#index})`;
    }
}
