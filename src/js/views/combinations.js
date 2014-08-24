var View = require('backbone').View;
var template = require('../templates/combinations.jade');

module.exports = View.extend({
	tagName: 'ul',
	className: 'item-combo-list',

	initialize: function() {
		this.render();
	},

	render: function() {
		console.log(this.$el.html(template({
			items: this.collection.models,
			title: 'Combinations'
		})));
	}
});