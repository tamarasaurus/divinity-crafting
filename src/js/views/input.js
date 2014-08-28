var View = require('backbone').View;
var template = require('../templates/input.jade');

module.exports = View.extend({
	tagName: 'div',
	className: 'input',

	events: {
		'keyup input': 'change'
	},

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el.html(template());
	},

	change: function(e) {


    console.log(this.collection);
    console.log(e);
	}

});