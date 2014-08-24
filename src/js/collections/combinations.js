var Collection = require('backbone').Collection;
var Combination = require('../models/combination');


module.exports = Collection.extend({
	model: Combination
});