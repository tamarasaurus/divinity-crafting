var Backbone = require('backbone');
Backbone.$ = jQuery;

var List = require('./views/combinations');
var Header = require('./views/header');
var Input = require('./views/input');

var data = require('./data');
var Combinations = require('./collections/combinations');
var combinations = new Combinations(data);

console.log(combinations);

var list = new List({el: $('.list'), collection: combinations});
var header = new Header({el: $('.header')});
var input = new Input({el: $('.search'), collection: combinations});

  // this.collection.findByIngredient('starfish');