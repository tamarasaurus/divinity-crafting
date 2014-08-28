var _ = require('underscore');
var View = require('backbone').View;
var template = require('../templates/combinations.jade');


module.exports = View.extend({
	tagName: 'ul',
	className: 'item-combo-list',

	initialize: function() {
		this.collection.on('reset', this.render, this);
		this.render();
	},

	render: function() {
		this.$el.html(template({
			items: this.collection.models,
			title: 'Combinations'
		}));
	},

});