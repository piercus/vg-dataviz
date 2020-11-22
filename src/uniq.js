const unpack = require('./unpack')

module.exports = function(rows, fn) {
	const arr = unpack(rows, fn);
  return arr.filter((a, index) => arr.indexOf(a) === index)
}
  

