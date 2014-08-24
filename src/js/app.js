var Backbone = require('backbone');
Backbone.$ = jQuery;
var data = require('./data');

var Combinations = require('./collections/combinations');
var List = require('./views/combinations');

var combinations = new Combinations(data);
var list = new List({collection: combinations, el: $('.main')});