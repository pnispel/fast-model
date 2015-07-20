import View from '../src/view';
import * as util from '../src/util';
import chai from 'chai';

var expect = chai.expect;
var assert = chai.assert;

describe('View', function () {
    var view;

    beforeEach(function () {
        view = new View();
    });

    it('should render', function () {
        view.render();
    });
});
