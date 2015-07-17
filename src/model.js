/* -------------------------------------------------------------------------- */
class Model {
    constructor () {
        this._data = {};
    }

    /**
     * set an item on this model by key
     *
     * @param {String} key - the path to the object you'd like
     * @param {object} value - the value to be set
     */
    set (key, value) {
        if (key !== null && typeof key === 'object') {
            this._data = key;

            return;
        }

        var keySplits = key.split('.');

        var lastKey = keySplits[keySplits.length - 1];
        var parent = _walkToParent(keySplits, this._data);

        if (lastKey === null) {
            parent = value;
        } else {
            if (!parent && lastKey) {
                if (isNaN(lastKey)) {
                    parent = {};
                } else {
                    parent = [];
                }
            }
            parent[lastKey] = value;
        }
    }

    /**
     * get an item from this model by key
     *
     * @param {String} key - the path to the object you'd like
     */
    get (key) {
        var keySplits = key.split('.');
        var lastKey = keySplits[keySplits.length - 1];

        var parent = _walkToParent(keySplits, this._data);

        var ret = (lastKey === null) ? parent : parent[lastKey];

        if (ret !== null && typeof ret === 'object') {
            return Object.freeze(ret);
        }

        return Object.freeze(ret);
    }
}

/**
 * walks to the parent of the object at `key`
 *
 * @param {String} key - the path to the object you'd like
 * @param {object} obj - the recusively built object (undefined at first)
 */
function _walkToParent (keySplits, obj) {
    // if (!keySplits || keySplits.length === 0) return obj;

    var nextKey = keySplits.splice(0, 1)[0];

    console.log('walk', obj, keySplits, nextKey, (keySplits.length === 0 && nextKey !== undefined));

    if (!obj && nextKey) {
        if (isNaN(nextKey)) {
            obj = {};
        } else {
            obj = [];
        }
    }

    // this is the object we need
    if (keySplits.length === 0 && nextKey) {
        console.log('final', obj, nextKey);
        console.log('------');
        return obj;
    } else {
        return _walkToParent(keySplits, obj[nextKey]);
    }
}

/* -------------------------------------------------------------------------- */

export default Model;
