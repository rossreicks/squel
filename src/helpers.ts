import { BaseBuilder } from "./base-builder";

// get whether object is a plain object
export function _isPlainObject(obj) {
    return obj && obj.constructor.prototype === Object.prototype;
}

// get whether object is an array
export function _isArray(obj) {
    return obj && obj.constructor.prototype === Array.prototype;
}

export function _extend<T>(dst: T, ...sources: T[]): T {
    if (dst && sources) {
        for (const src of sources) {
            if (typeof src === "object") {
                Object.getOwnPropertyNames(src).forEach((key) => {
                    dst[key] = src[key];
                });
            }
        }
    }

    return dst;
}

export function _clone(src) {
    if (!src) {
        return src;
    }

    if (typeof src.clone === "function") {
        return src.clone();
    }
    if (_isPlainObject(src) || _isArray(src)) {
        const ret = new src.constructor();

        Object.getOwnPropertyNames(src).forEach((key) => {
            if (typeof src[key] !== "function") {
                ret[key] = _clone(src[key]);
            }
        });

        return ret;
    }
    return JSON.parse(JSON.stringify(src));
}

export function isSquelBuilder(obj) {
    return obj && obj instanceof BaseBuilder && !!obj._toParamString;
}

export const _shouldApplyNesting = function (obj) {
    return !isSquelBuilder(obj) || !obj.options.rawNesting;
};

// append to string if non-empty
export function _pad(str, pad) {
    return str.length ? str + pad : str;
}

export function registerValueHandler(handlers, type, handler) {
    const typeofType = typeof type;

    if (typeofType !== "function" && typeofType !== "string") {
        throw new Error("type must be a class constructor or string");
    }

    if (typeof handler !== "function") {
        throw new Error("handler must be a function");
    }

    for (const typeHandler of handlers) {
        if (typeHandler.type === type) {
            typeHandler.handler = handler;

            return;
        }
    }

    handlers.push({
        type,
        handler,
    });
}
