import * as util from '../src/util';

/* -------------------------------------------------------------------------- */

class Emitter {
    constructor () {
        this._namedEventCallbacks = {};
        this._emitCallbacks = [];
    }

    on () {
        let arg1 = arguments[0];
        let arg2 = arguments[1];
        let arg3 = arguments[2];

        let event, fn, thisArg;

        if (util.isString(arg1)) {
            setNamedCallback.call(this);
        } else {
            setGlobalCallback.call(this);
        }

        function setNamedCallback () {
            event = arg1;
            fn = arg2;
            thisArg = arg3 || this;

            this._namedEventCallbacks[event] =
                this._namedEventCallbacks[event] || [];

            this._namedEventCallbacks[event].push({
                fn: fn,
                ctx: thisArg
            });
        }

        function setGlobalCallback () {
            fn = arg1;
            thisArg = arg2 || this;

            this._emitCallbacks.push({
                fn: fn,
                ctx: thisArg
            });
        }
    }

    off () {
        let arg1 = arguments[0];
        let arg2 = arguments[1];

        let fn = (util.isString(arg1)) ? arg2 : arg1;
        let fnString = fn.toString();

        let functions = this._namedEventCallbacks[arg1] ||
                        this._emitCallbacks;

        for (let i = 0; i < functions.length; i++) {
            var obj = functions[i];

            if (obj.fn === fn) {
                functions.splice(i, 1);

                break;
            }
        }
    }

    trigger (event) {
        let extraArgs = Array.prototype.slice.call(arguments, 1);
        let callbacks = this._namedEventCallbacks[event];

        if (!callbacks || !callbacks.length) return;

        for (let i = 0; i < callbacks.length; i++) {
            let obj = callbacks[i];

            obj.fn.apply(obj.ctx, extraArgs);
        }
    }

    emit () {
        var callbacks = this._emitCallbacks;

        if (!callbacks || !callbacks.length) return;

        for (let i = 0; i < callbacks.length; i++) {
            let obj = callbacks[i];

            obj.fn.apply(obj.ctx, arguments);
        }
    }
}

/* -------------------------------------------------------------------------- */

export default Emitter;
