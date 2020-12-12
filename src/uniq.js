const unpack = require('./unpack');

module.exports = function (rows, fn) {
	const array = unpack(rows, fn);
	return array.filter((a, index) => array.indexOf(a) === index);
};

