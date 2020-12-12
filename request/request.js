const axios = require('axios');
const parse = require('./parse');
module.exports = function (url, mode = 'json') {
	return axios.get(url, {
	      responseType: 'arraybuffer'
	  }).then(response => {
		return parse(response.data, mode);
	});
};

// Return
