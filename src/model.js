import Emitter from './emitter';
import * as util from './util';
import {diff} from './diff';

/* -------------------------------------------------------------------------- */

class Model extends Emitter {
    constructor () {
        super();

        this._data = {};
    }

    /**
     * set an item on this model by key
     *
     * @param {String} key - the path to the object you'd like
     * @param {object} value - the value to be set
     */

     // TODO: add "silent" and allow setting root to do diff
    set (key, value, createDuringWalk=false) {
        if (util.isObject(key)) {
            this._data = key;

            return;
        }

        if (!util.isString(key)) return;

        var keySplits = key.split('.');

        var lastKey = keySplits[keySplits.length - 1];
        var parent = _walkToParent(keySplits, this._data, createDuringWalk);

        var changes;

        if (lastKey === null) {
            changes = diff(parent, value);
            parent = value;
        } else {
            changes = diff(parent[lastKey], value);
            parent[lastKey] = value;
        }

        changes.removed.forEach((function (el) {
            var lastPathIsNum = !isNaN(el.path.slice(-1)[0]);

            this.trigger('removed:' +
                keySplits.concat(el.path).join('.'), el);

            if (lastPathIsNum) {
                var newPath = el.path.slice(0, el.path.length - 2);
            }

            this.trigger('removed:' +
                keySplits.concat(newPath).join('.'), el);
        }).bind(this));

        changes.added.forEach((function (el) {
            var lastPathIsNum = !isNaN(el.path.slice(-1)[0]);

            this.trigger('added:' +
                keySplits.concat(el.path).join('.'), el);

            if (lastPathIsNum) {
                var newPath = el.path.slice(0, el.path.length - 2);
            }

            this.trigger('added:' +
                keySplits.concat(newPath).join('.'), el);
        }).bind(this));

        changes.changed.forEach((function (el) {
            var lastPathIsNum = !isNaN(el[0].path.slice(-1)[0]);

            this.trigger('changed:' +
                keySplits.concat(el[0].path).join('.'), el);

            if (lastPathIsNum) {
                var newPath = el[0].path.slice(0, el[0].path.length - 2);
            }

            this.trigger('changed:' +
                keySplits.concat(newPath).join('.'), el);
        }).bind(this));

        changes.moved.forEach((function (el) {
            var lastPathIsNum = !isNaN(el[0].path.slice(-1)[0]);

            this.trigger('moved:' +
                keySplits.concat(el[0].path).join('.'), el);

            if (lastPathIsNum) {
                var newPath = el[0].path.slice(0, el[0].path.length - 2);
            }

            this.trigger('moved:' +
                keySplits.concat(newPath).join('.'), el);
        }).bind(this));
    }

    getMutable (key) {
        if (!key) return JSON.parse(JSON.stringify(this._data));
        if (!util.isString(key)) return;

        var keySplits = key.split('.');
        var lastKey = keySplits[keySplits.length - 1];

        var parent = _walkToParent(keySplits, this._data);

        if (parent === false) return false;

        var ret = (lastKey === null) ? parent : parent[lastKey];

        return JSON.parse(JSON.stringify(ret));
    }

    /**
     * get an item from this model by key
     *
     * @param {String} key - the path to the object you'd like
     */
    get (key) {
        var mutableValue = this.getMutable(key);

        return util.isObject(mutableValue) ?
            Object.freeze(mutableValue) : mutableValue;
    }
}

/**
 * walks to the parent of the object at `key`
 *
 * @param {String} key - the path to the object you'd like
 * @param {object} obj - the recusively built object (undefined at first)
 */
function _walkToParent (keySplits, obj, createDuringWalk=false) {
    // this is the object we need
    if (keySplits.length === 1) {
        return obj;
    } else {
        var nextKey = keySplits.splice(0, 1)[0];
        var twoKeys = keySplits.slice(0,1)[0];

        if (!obj[nextKey] && createDuringWalk) {
            if (twoKeys && !isNaN(twoKeys)) {
                obj[nextKey] = [];
            } else {
                obj[nextKey] = {};
            }
        } else if (!obj[nextKey]) {
            return false;
        }

        return _walkToParent(keySplits, obj[nextKey], createDuringWalk);
    }
}

/* -------------------------------------------------------------------------- */

export default Model;
