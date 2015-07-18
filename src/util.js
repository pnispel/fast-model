// from fastjs
export function filter(arr, fn, thisContext) {
    var length = arr.length;
    var result = [];
    var i = 0;

    var iterator = (thisContext !== undefined) ?
        bindInternal3(fn, thisContext) : fn;

    for (; i < length; i++) {
        if (iterator(arr[i], i, arr)) {
            result.push(arr[i]);
        }
    }

    return result;
}

// from fastjs
export function indexOf (arr, target, fromIndex) {
    var length = arr.length;
    var i = 0;

    if (typeof fromIndex === 'number') {
        i = fromIndex;
        if (i < 0) {
            i += length;
            if (i < 0) {
                i = 0;
            }
        }
    }

    for (; i < length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }

    return -1;
}

// from underscore
export function isObject (object) {
    var type = typeof object;

    return (type === 'object' || type === 'function') && !!object;
}

// from underscore
export function isString (str) {
    return Object.prototype.toString.call(str) === '[object String]';
}

// from underscore
export function isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

