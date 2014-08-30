var _ = require('underscore');
var View = require('backbone').View;
var template = require('../templates/combinations.jade');


module.exports = View.extend({
	tagName: 'ul',
	className: 'item-combo-list',
	events: {
		'click .item-title, .arrow': 'toggle'
	},

	initialize: function() {
		this.collection.on('reset', this.render, this);
		this.render();

	},

	toggle: function(e) {
		$(e.currentTarget).parent().toggleClass('active');
	},
	render: function() {
		this.$el.html(template({
			items: this.collection.models,
			title: 'Combinations'
		}));
	},

});