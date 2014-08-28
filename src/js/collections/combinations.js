var Collection = require('backbone').Collection;
var Combination = require('../models/combination');

var CombinationCollection = Collection.extend({
	model: Combination,
	initialize: function(data) {
		this.originalModels = data;
	},

	findByIngredient: function(query) {
		this.reset(this.originalModels);
		var filtered = this.filter(function(item) {
			return item.get('input_1').toLowerCase().indexOf(query.toLowerCase()) > -1 || item.get('input_2').toLowerCase().indexOf(query.toLowerCase()) > -1;
		});
		this.reset(filtered);
	}
});
module.exports = CombinationCollection;