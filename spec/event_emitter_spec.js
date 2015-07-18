import Emitter from '../src/emitter';
import * as util from '../src/util';
import chai from 'chai';
import chaiSpy from 'chai-spies';

chai.use(chaiSpy);

var expect = chai.expect;
var assert = chai.assert;

describe('Event Emitter', function () {
    var emitter;

    beforeEach(function () {
        emitter = new Emitter();
    });

    it('should let you add a named event callback', function () {
        emitter.on('test', new Function);
        emitter.on('test', new Function);
        emitter.on('another', new Function);

        assert(emitter._namedEventCallbacks['test'].length === 2);
        assert(emitter._namedEventCallbacks['another'].length === 1);
    });

    it('should let you add a global callback', function () {
        emitter.on(new Function);
        emitter.on(new Function);
        emitter.on(new Function);

        assert(emitter._emitCallbacks.length === 3);
    });

    it('should let you remove a named callback', function () {
        var fn = function fn () {var test = 1;};
        var fn2 = function () {var test = 1;};

        emitter.on('test', fn);
        emitter.on('test', fn2);
        emitter.off('test', fn);

        assert(emitter._namedEventCallbacks['test'].length === 1);
    });

    it('should let you remove a global callback', function () {
        var fn = function () {var test = 1;};
        var fn2 = function () {var test = 1;};

        emitter.on(fn);
        emitter.on(fn2);
        emitter.off(fn);

        assert(emitter._emitCallbacks.length === 1);
    });

    it('should call a named callback', function () {
        var fn = function () {var test = 1;};
        var fn2 = function () {var test = 1;};
        var fn3 = function () {var test = 1;};

        var spy = chai.spy(fn);
        var spy2 = chai.spy(fn2);
        var spy3 = chai.spy(fn3);

        emitter.on('test', spy);
        emitter.on('another', spy2);
        emitter.on(spy3);

        emitter.trigger('test');

        expect(spy).to.have.been.called.once;
        expect(spy2).to.have.been.called.exactly(0);
        expect(spy3).to.have.been.called.exactly(0);
    });

    it('should call a global callback', function () {
        var fn = function () {var test = 1;};
        var fn2 = function () {var test = 1;};
        var fn3 = function () {var test = 1;};

        var spy = chai.spy(fn);
        var spy2 = chai.spy(fn2);
        var spy3 = chai.spy(fn3);

        emitter.on(spy);
        emitter.on(spy2);
        emitter.on('test', spy3);

        emitter.emit();

        expect(spy).to.have.been.called.once;
        expect(spy2).to.have.been.called.once;
        expect(spy3).to.have.been.called.exactly(0);
    });

    it('should call with the correct context for named', function () {
        var ctx = {
            thing: 1
        };

        var fn = function () {
            assert(this.thing === 1);
        };

        emitter.on('test', fn, ctx);

        emitter.trigger('test');
    });

    it('should call with the correct context for global', function () {
        var ctx = {
            thing: 1
        };

        var fn = function () {
            assert(this.thing === 1);
        };

        emitter.on(fn, ctx);

        emitter.emit();
    });
});
