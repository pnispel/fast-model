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
        var keySplitsClone = keySplits.slice(0);

        var lastKey = keySplits[keySplits.length - 1];
        var parent = _walkToParent(keySplits, this._data, createDuringWalk);

        var script;

        if (lastKey === null) {
            script = diff(parent, value);
            parent = value;
        } else {
            script = diff(parent[lastKey], value);
            parent[lastKey] = value;
        }

        console.log(JSON.stringify(script, null, 2));
        // for (var i = 0; i < script.length; i++) {
        //     var el = script[i];
        //     var method = el[0];
        //     var xtraArguments = Array.prototype.slice.call(el, 1);
        //     var path = el[1].path;
        //     var hasLength = (keySplitsClone.concat(path).length > 1);
        //     var paths = [keySplitsClone.concat(path)];

        //     if (hasLength) {
        //         paths.push(
        //             keySplitsClone.concat(path.slice(0, path.length - 1)));
        //     }

        //     for (var j = 0; j < paths.length; j++) {
        //         // console.log(method + ':' + paths[j].join('.'));
        //         this.trigger(method + ':' + paths[j].join('.'), xtraArguments);
        //     }
        // };
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
