var View = require('backbone').View;
var template = require('../templates/combinations.jade');

module.exports = View.extend({
	tagName: 'ul',
	className: 'item-combo-list',
	events: {
		'click .item-title, .arrow': 'toggle',
		'click .item-input': 'setFilter'
	},

	initialize: function() {
		this.collection.on('reset', this.render, this);
		this.render();
	},

	setFilter: function(e) {
		$('input[type="search"]').val($(e.currentTarget).text()).trigger('input');
	},

	toggle: function(e) {
		$(e.currentTarget).parent().toggleClass('active');
	},

	render: function() {
		this.$el.html(template({
			items: this.collection.models,
			title: 'Combinations'
		}));
		window.scrollTo(0, 0);

		Waves.displayEffect({
			duration: 300
		});
	},

});