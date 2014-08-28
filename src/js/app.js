var Backbone = require('backbone');
Backbone.$ = jQuery;
var data = require('./data');

var Combinations = require('./collections/combinations');
var List = require('./views/combinations');
var Header = require('./views/header');
var Input = require('./views/input');

var combinations = new Combinations(data);

var list = new List({collection: combinations, el: $('.list')});
var header = new Header({el: $('.header')});
var input = new Input({el: $('.search')});

console.log(list, header, input);