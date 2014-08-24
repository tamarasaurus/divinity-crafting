var Backbone = require('backbone');
Backbone.$ = jQuery;
var data = require('./data');

var Combinations = require('./collections/combinations');
var combinations = new Combinations(data);

