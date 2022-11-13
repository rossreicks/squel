/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { BaseBuilder } from '../cls';
import { Block } from '.';
import { _isArray } from '../helpers';

/**
 * Base class for setting fields to values (used for INSERT and UPDATE queries)
 */
export abstract class AbstractSetFieldBlock extends Block {
    _fields: (string | BaseBuilder)[];
    _values: any[][];
    _valueOptions: any[][];

    constructor(options) {
        super(options);

        this._reset();
    }

    _reset() {
        this._fields = [];
        this._values = [[]];
        this._valueOptions = [[]];
    }

    // Update the given field with the given value.
    // This will override any previously set value for the given field.
    _set(field, value, valueOptions = {}) {
        if (this._values.length > 1) {
            throw new Error('Cannot set multiple rows of fields this way.');
        }

        if (typeof value !== 'undefined') {
            value = this._sanitizeValue(value);
        }

        field = this._sanitizeField(field);

        // Explicity overwrite existing fields
        let index = this._fields.indexOf(field);

        // if field not defined before
        if (index === -1) {
            this._fields.push(field);
            index = this._fields.length - 1;
        }

        this._values[0][index] = value;
        this._valueOptions[0][index] = valueOptions;
    }

    // Insert fields based on the key/value pairs in the given object
    _setFields(fields, valueOptions = {}) {
        if (typeof fields !== 'object') {
            throw new Error(`Expected an object but got ${typeof fields}`);
        }

        for (const field in fields) {
            this._set(field, fields[field], valueOptions);
        }
    }

    // Insert multiple rows for the given fields. Accepts an array of objects.
    // This will override all previously set values for every field.
    _setFieldsRows(fieldsRows, valueOptions = {}) {
        if (!_isArray(fieldsRows)) {
            throw new Error(`Expected an array of objects but got ${typeof fieldsRows}`);
        }

        // Reset the objects stored fields and values
        this._reset();

        // for each row
        for (let i = 0; fieldsRows.length > i; ++i) {
            const fieldRow = fieldsRows[i];

            // for each field
            for (let field in fieldRow) {
                let value = fieldRow[field];

                field = this._sanitizeField(field);
                value = this._sanitizeValue(value);

                let index = this._fields.indexOf(field);

                if (i > 0 && index === -1) {
                    throw new Error('All fields in subsequent rows must match the fields in the first row');
                }

                // Add field only if it hasn't been added before
                if (index === -1) {
                    this._fields.push(field);
                    index = this._fields.length - 1;
                }

                // The first value added needs to add the array
                if (!_isArray(this._values[i])) {
                    this._values[i] = [];
                    this._valueOptions[i] = [];
                }

                this._values[i][index] = value;
                this._valueOptions[i][index] = valueOptions;
            }
        }
    }
}
