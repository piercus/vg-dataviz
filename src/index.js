const Plotly = require('plotly.js-dist');

Plotly.d3.json('./data.json', function(err, json){
	if(err){
		console.log('err', err)
	} else {
		require('./speed-progress.js')(json);
	}
})
