/**
 * ItemModal.jsx
 *
 * The modal that pops up on top of a list for viewing and editing one item. It
 * carries a labelled control for each of an item's fields, Previous and Next for
 * walking the list without closing the box, and OK and Cancel.
 *
 * This modal changes nothing. It reads a set of values in, hands the values the
 * user typed back out to commitItemModal, and lets the editor hook decide
 * whether that becomes an add transaction, an edit transaction, or nothing at
 * all because the user changed their mind.
 *
 * Previous and Next commit first and then move, which is what makes them useful:
 * a user can open the first item, fix a typo, press Next, fix the next one, and
 * every one of those fixes lands on the undo stack as its own transaction.
 *
 * THE FORM IS CONTROLLED, WHICH THE LIST NAME FIELD IS NOT
 * -------------------------------------------------------
 * Worth comparing the two, because the reasons differ and the choice is not a
 * matter of house style.
 *
 * Here the five fields are held in one piece of state and every keystroke goes
 * through React. That is what a form usually wants: the values have to be read
 * as a set when OK is pressed, Previous and Next have to replace all five at
 * once, and nothing is written to the model until the user says so, so there is
 * no cost to re-rendering on each keystroke.
 *
 * The list name field in the toolbar is uncontrolled for the opposite reason: it
 * writes to the model through a transaction, and one transaction per keystroke
 * would make Ctrl+Z undo a single letter at a time.
 *
 * The `key` on this component in ModalLayer is what reloads the five fields when
 * Previous or Next moves to a different item; see the note there.
 */
import { useRef, useState } from 'react';
import { ModalNames, useModals } from '../../context/ModalContext.jsx';
import { useListEditor } from '../../hooks/useListEditor.js';
import { DateUtil } from '../../common/DateUtil.js';
import { PRIORITIES } from '../../model/priority.js';
import Modal, { ModalButton, ModalFooter, ModalHeading } from './Modal.jsx';

export default function ItemModal() {
    const { itemModal, closeItemModal } = useModals();
    const { commitItemModal } = useListEditor();

    const descriptionRef = useRef(null);

    // one piece of state for the whole form, so that Previous and Next can
    // replace every field in a single update
    const [values, setValues] = useState(() => ({
        description: itemModal.values.description ?? '',
        dateEntered: itemModal.values.dateEntered ?? DateUtil.today(),
        priority: itemModal.values.priority,
        targetDate: itemModal.values.targetDate,
        completed: itemModal.values.completed === true
    }));

    const isEditing = itemModal.mode === 'edit';

    function setField(field, value) {
        setValues((previous) => ({ ...previous, [field]: value }));
    }

    /**
     * Validates on the way out and hands the values over.
     *
     * @param {string} then 'close', 'next' or 'previous'
     */
    function commit(then) {
        commitItemModal({
            mode: itemModal.mode,
            index: itemModal.index,
            values: {
                ...values,
                description: values.description.trim(),
                dateEntered: values.dateEntered || DateUtil.today(),
                targetDate: values.targetDate || null
            },
            then
        });
    }

    /**
     * Pressing Enter anywhere in the form is the same as pressing OK.
     * preventDefault also stops the browser from submitting the form itself.
     */
    function handleFormKeyDown(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        commit('close');
    }

    // Previous is meaningless on the first item, Next on the last, and both are
    // meaningless while describing an item that does not exist yet
    const canGoPrevious = isEditing && itemModal.index > 0;
    const canGoNext = isEditing && itemModal.index < itemModal.itemCount - 1;

    return (
        <Modal
            name={ModalNames.ITEM}
            id="item-modal"
            labelledBy="item-modal-heading"
            // Escape means cancel, exactly like the Cancel button
            onCancel={closeItemModal}
            // the description is the field the user actually came here to type
            // in, so that is where focus belongs, not on whatever control happens
            // to come first
            initialFocusRef={descriptionRef}>

            <ModalHeading id="item-modal-heading">
                {isEditing ? `Item ${itemModal.index + 1} of ${itemModal.itemCount}` : 'New Item'}
            </ModalHeading>

            <form id="item-modal-form" autoComplete="off"
                  onKeyDown={handleFormKeyDown}
                  onSubmit={(event) => event.preventDefault()}
                  className="flex flex-col gap-4 p-5">

                <div className={FIELD}>
                    <label className={FIELD_LABEL} htmlFor="item-description-input">Description</label>
                    <input
                        id="item-description-input"
                        ref={descriptionRef}
                        type="text"
                        maxLength={200}
                        placeholder="What needs to be done?"
                        value={values.description}
                        onChange={(event) => setField('description', event.target.value)}
                        className={CONTROL} />
                </div>

                <div className={FIELD_ROW}>
                    <div className={FIELD}>
                        <label className={FIELD_LABEL} htmlFor="item-date-entered-input">Date Entered</label>
                        <input
                            id="item-date-entered-input"
                            type="date"
                            value={values.dateEntered ?? ''}
                            onChange={(event) => setField('dateEntered', event.target.value)}
                            className={`${CONTROL} min-w-36`} />
                    </div>

                    <div className={FIELD}>
                        <label className={FIELD_LABEL} htmlFor="item-priority-select">Priority</label>
                        {/*
                            The options come from the priority module rather than
                            being listed here, so that adding a fourth priority
                            stays a one line change in one file. HW1 made the same
                            point with a <template> for the option's shape; JSX
                            makes the shape and the loop the same expression.
                        */}
                        <select
                            id="item-priority-select"
                            value={values.priority}
                            onChange={(event) => setField('priority', event.target.value)}
                            className={CONTROL}>
                            {PRIORITIES.map((priority) => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={FIELD}>
                    <span className={FIELD_LABEL}>Target Date</span>
                    {/*
                        The date comes first, because it is the field this section
                        is named for. The checkbox beside it is a separate fact: a
                        target date says when an item is meant to be finished, the
                        checkbox says whether it actually is. The date control is
                        never disabled, whatever the checkbox says.
                    */}
                    <div className="flex items-center gap-3">
                        <input
                            id="item-target-date-input"
                            type="date"
                            aria-label="The date this item is meant to be finished by"
                            value={values.targetDate ?? ''}
                            onChange={(event) => setField('targetDate', event.target.value)}
                            className={`${CONTROL} w-auto min-w-36 flex-none`} />
                        <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
                            <input
                                id="item-completed-checkbox"
                                type="checkbox"
                                checked={values.completed}
                                onChange={(event) => setField('completed', event.target.checked)}
                                className="h-[1.0625rem] w-[1.0625rem] cursor-pointer accent-sbu-red" />
                            <span>Completed</span>
                        </label>
                    </div>
                </div>
            </form>

            <ModalFooter>
                <div className="flex gap-2">
                    <ModalButton id="item-previous-button" variant="quiet"
                                 disabled={!canGoPrevious}
                                 title="Save and move to the previous item"
                                 onClick={() => commit('previous')}>
                        ◀&nbsp;Previous
                    </ModalButton>
                    <ModalButton id="item-next-button" variant="quiet"
                                 disabled={!canGoNext}
                                 title="Save and move to the next item"
                                 onClick={() => commit('next')}>
                        Next&nbsp;▶
                    </ModalButton>
                </div>
                <div className="ml-auto flex gap-2">
                    <ModalButton id="item-cancel-button" variant="secondary"
                                 onClick={closeItemModal}>
                        Cancel
                    </ModalButton>
                    <ModalButton id="item-ok-button" variant="primary"
                                 onClick={() => commit('close')}>
                        {isEditing ? 'OK' : 'Add'}
                    </ModalButton>
                </div>
            </ModalFooter>
        </Modal>
    );
}

const FIELD = 'flex min-w-0 flex-1 flex-col gap-[0.3125rem]';

const FIELD_LABEL =
    'text-xs font-bold tracking-[0.08em] uppercase text-grey-700';

const FIELD_ROW =
    'flex items-end gap-4 max-[46rem]:flex-col max-[46rem]:items-stretch';

/**
 * Scoped to controls inside this modal on purpose. HW1 made the same point in
 * CSS and had to say so in a comment, because the list name field in the toolbar
 * is also an input[type="text"] and an unscoped rule would have painted a white
 * box in the middle of the red toolbar. Utility classes cannot leak like that at
 * all, which is one of the genuine advantages of writing styles this way.
 */
const CONTROL =
    'w-full rounded-control border border-grey-300 bg-sbu-white px-2.5 py-2 text-base '
    + 'text-grey-900 placeholder:text-grey-500 '
    + 'focus:border-sbu-red focus:outline-2 focus:outline-offset-[0.0625rem] focus:outline-sbu-red '
    + 'disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-grey-500';
