const Plotly = require('plotly.js-dist');

Plotly.d3.json('./data.json', (err, json) => {
	if (err) {
		console.log('err', err);
	} else {
		const data1 = require('./speed-progress-data.js')(json, {xaxis: 'x', yaxis: 'y', showlegend: true});
		const data2 = require('./dist-to-first-progress-data.js')(json, {xaxis: 'x2', yaxis: 'y2'});
		const {shapesLayout, shapesData} = require('./progress-cues')({
			configs: [{
				xaxis: 'x', yaxis: 'y', ymax: Math.max(...data1.map(b => Math.max(...b.y)))
			}, {
				xaxis: 'x2', yaxis: 'y2', ymax: Math.max(...data2.map(b => Math.max(...b.y))), showlegend: true
			}]
		});
		const layout = {
      plot_bgcolor:"#00395E",
      paper_bgcolor:"#00395E",
			xaxis: {
				domain: [0, 1],
				anchor: 'y'
			},
			font: {
				family: 'Courier New, monospace',
				color: '#ffffff'
			},
			xaxis2: {
				domain: [0, 1],
				title: {
					text: 'Progress (%)'
				},
				anchor: 'y2'
			},
			yaxis: {
				domain: [0.52, 1],
				title: {
					text: 'Speed (boat/VMG)<br>(knots)',
					font: {
						size: 10
					}
				},
				anchor: 'x'
			},
			yaxis2: {
				domain: [0, 0.48],
				title: {
					text: 'Distance to leader<br>(nm)',
					font: {
						size: 10
					}
				},
				anchor: 'x2'
			},
			legend: {
				tracegroupgap: 0
			},
			shapes: shapesLayout,
			title: 'Vendée Globe 2020, race charts'
		};

		Plotly.newPlot('my-div', data1.concat(data2).concat(shapesData), layout);
		const spinner = document.getElementById('spinner')
		spinner.remove();
	}
});
