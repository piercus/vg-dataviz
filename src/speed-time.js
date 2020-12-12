const Plotly = require('plotly.js-dist');

Plotly.d3.csv('./positions.csv', (err, rows) => {
	const names = uniq(rows, 'name');

	const data = names.map(name => {
		const filtered = rows.filter(r => {
			return r.name === name;
		});
		const x = unpack(filtered, r => {
			const number = Number.parseInt(r.timestamp);
			if (Number.isNaN(number)) {
				console.log('NaN', number);
			}

			return new Date(number * 1000);
		});
		return {
			type: 'scatter',
			connectgaps: false,
			y: unpack(filtered, r => r.knots),
			x,
			name
		};
	});

	Plotly.newPlot('myDiv2', data);
});
