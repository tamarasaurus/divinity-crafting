'use strict';

/* global jQuery, $ */

var Backbone = require('backbone');
Backbone.$ = jQuery;

var List = require('./views/combinations');
var Header = require('./views/header');
var Input = require('./views/input');

var data = require('./data');
var Combinations = require('./collections/combinations');
var combinations = new Combinations(data);

new List({
  el: $('.list'),
  collection: combinations
});
new Header({
  el: $('.header')
});
new Input({
  el: $('.search'),
  collection: combinations
});
