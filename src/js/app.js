var data = require('./data');
var Item = require('./models/item');

var item = new Item({
  title: 'Check attributes property of the logged models in the console.'
});

console.log(item, data);