'use strict';

var View = require('backbone').View;
var template = require('../templates/header.jade');

module.exports = View.extend({
  tagName: 'div',
  className: 'header',

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(template({
      title: 'Crafty'
    }));
  }
});
