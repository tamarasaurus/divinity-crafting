'use strict';

var Model = require('backbone').Model;

module.exports = Model.extend({
  defaults: {
    input_1: '',
    input_2: '',
    notes: null,
    output: '',
    output_category: '',
    skill: null,
    skill_level: null
  }
});
