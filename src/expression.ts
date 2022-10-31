/* eslint-disable no-param-reassign */
import { BaseBuilder } from "./base-builder";
import { Options } from "./types/options";
import { isSquelBuilder } from "./helpers";

/**
 * An SQL expression builder.
 *
 * SQL expressions are used in WHERE and ON clauses to filter data by various criteria.
 *
 * Expressions can be nested. Nested expression contains can themselves
 * contain nested expressions. When rendered a nested expression will be
 * fully contained within brackets.
 *
 * All the build methods in this object return the object instance for chained method calling purposes.
 */
export class Expression extends BaseBuilder {
    _nodes: { type: string; expr: string | BaseBuilder; para: any[] }[];

    // Initialize the expression.
    constructor(options) {
        super(options);

        this._nodes = [];
    }

    // Combine the current expression with the given expression using the intersection operator (AND).
    and(expr, ...params) {
        expr = this._sanitizeExpression(expr);

        this._nodes.push({
            type: "AND",
            expr,
            para: params,
        });

        return this;
    }

    // Combine the current expression with the given expression using the union operator (OR).
    or(expr, ...params) {
        expr = this._sanitizeExpression(expr);

        this._nodes.push({
            type: "OR",
            expr,
            para: params,
        });

        return this;
    }

    _toParamString(options: Options = {}) {
        let totalStr = [];
        const totalValues = [];

        for (const node of this._nodes) {
            const { type, expr, para } = node;

            const { text, values } = isSquelBuilder(expr)
                ? (expr as BaseBuilder)._toParamString({
                      buildParameterized: options.buildParameterized,
                      nested: true,
                  })
                : this._buildString(expr as string, para, {
                      buildParameterized: options.buildParameterized,
                  });
            if (totalStr.length) {
                totalStr.push(type);
            }

            totalStr.push(text);
            values.forEach((value) => totalValues.push(value));
        }

        const joinString = totalStr.join(" ");

        return {
            text: this._applyNestingFormatting(joinString, !!options.nested),
            values: totalValues,
        };
    }
}
