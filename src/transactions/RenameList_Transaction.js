/**
 * RenameList_Transaction.js
 *
 * The jsTPS library employs the Command design pattern, and each transaction,
 * including this one, is used as a command: an undoable action packaged as an
 * object with doTransaction() and undoTransaction().
 *
 * Records a change to the open list's name. Renaming a list is an edit made from
 * inside the list view, so like every other edit made there it belongs on the
 * undo stack. All it needs to remember is the name before and the name after.
 */
import { jsTPS_Transaction } from '../lib/jsTPS.js';

export class RenameList_Transaction extends jsTPS_Transaction {
    #operations;
    #oldName;
    #newName;

    /**
     * @param {Object} operations the list operations handed out by CurrentListContext
     * @param {string} oldName the name before the edit
     * @param {string} newName the name after the edit
     */
    constructor(operations, oldName, newName) {
        super();
        this.#operations = operations;
        this.#oldName = oldName;
        this.#newName = newName;
    }

    doTransaction() {
        this.#operations.setName(this.#newName);
    }

    undoTransaction() {
        this.#operations.setName(this.#oldName);
    }

    toString() {
        return `RenameList_Transaction(${this.#oldName} to ${this.#newName})`;
    }
}
