var View = require('backbone').View;
var _ = require('underscore');
var template = require('../templates/input.jade');

module.exports = View.extend({
	tagName: 'div',
	className: 'input',

	events: {
		'input input': 'change'
	},

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el.html(template());

		$(this.$el.find('form')).submit(function(e) {
			e.preventDefault();
		});
	},

	change: function(e) {
		var val = $(e.currentTarget).val();
		if (!_.isEmpty(val)) {
			this.setFilter(this.collection, val);
		} else {
			this.collection.reset(this.collection.originalModels);
		}
	},

	setFilter: _.debounce(function(collection, val) {
		collection.findByIngredient(val);
	}, 500)

});