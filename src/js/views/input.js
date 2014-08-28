var View = require('backbone').View;
var template = require('../templates/input.jade');

module.exports = View.extend({
  tagName: 'div',
  className: 'input',

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(template());
  }
});