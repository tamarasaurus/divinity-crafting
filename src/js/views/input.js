'use strict';
/* global $ */

var View = require('backbone').View;
var _ = require('underscore');
var template = require('../templates/input.jade');

module.exports = View.extend({
  tagName: 'div',
  className: 'input',

  events: {
    'input input': 'change',
    'submit form': 'submit'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(template());
  },

  submit: function(e) {
    $(this.$el).find('input').blur();
    e.preventDefault();
  },

  change: function(e) {
    var val = $(e.currentTarget).val();
    if(!_.isEmpty(val)) {
      this.setFilter(this.collection, val);
    } else {
      this.collection.reset(this.collection.originalModels);
    }
  },

  setFilter: _.debounce(function(collection, val) {
    collection.findByIngredient(val);
  }, 500)

});
