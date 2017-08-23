'use strict';

import NCLNameCaseUa from './NCLNameCaseUa.js';
import NCLNameCaseRu from './NCLNameCaseRu.js';
import NCL from './NCL/NCL.js';
NCL.setConcreteClasses({
    ru: NCLNameCaseRu,
    ua: NCLNameCaseUa,
});

export {NCLNameCaseUa, NCLNameCaseRu, NCL};
