var Collection = require('backbone').Collection;
var Combination = require('../models/combination');

module.exports = Collection.extend({
	model: Combination,
	findByIngredient: function(query) {

    var filtered =  this.filter(function(item) {
			return item.get('input_1').toLowerCase() === query.toLowerCase() || item.get('input_2').toLowerCase() === query.toLowerCase();
		});

    this.reset(filtered);
	}
});