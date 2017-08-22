const assert = require('assert');
const {NCLNameCaseUa, NCLNameCaseRu} = require('../build/index.js');

describe('NCLNameCaseRu', () => {
    'use strict';
    let nclRu = new NCLNameCaseRu();
    it(`test`, () => {
        assert.strictEqual(
            nclRu.q("Облогин Денис", 1),
            "Облогина Дениса"
        );
    });
});

describe('NCLNameCaseUa', () => {
    'use strict';
    let nclUa = new NCLNameCaseUa();
    it(`test`, () => {
        assert.strictEqual(
            nclUa.q("Облогін Денис", 1),
            "Облогіна Дениса"
        );
    });
});