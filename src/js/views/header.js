'use strict';

var View = require('backbone').View;
var template = require('../templates/header.jade');

module.exports = View.extend({
  tagName: 'div',
  className: 'header',

  events: {
    'click .burger': 'showSidebar',
    'click .sidebar': 'showSidebar'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(template({
      title: 'Crafty'
    }));
  },

  showSidebar: function(e) {
    console.log(e);
    var sidebar = this.$el.find('.sidebar')
    
    if(!sidebar.hasClass('show')){
      sidebar.addClass('show')
      $('body,html').addClass('cover')
    }else{
      sidebar.removeClass('show')
      $('body,html').removeClass('cover')
    }
   
  },
});