const Plotly = require('plotly.js-dist');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let paramBoats = urlParams.get('boats')
if(paramBoats){
	paramBoats = paramBoats.split(',')
}
let paramStart= urlParams.get('start')
if(paramStart){
	paramStart = new Date(parseInt(paramStart, 10))
}
let paramEnd= urlParams.get('end')
if(paramEnd){
	paramEnd = new Date(parseInt(paramEnd, 10))
}

const filterWithParams = function(opts, {paramBoats, paramStart, paramEnd}){
	const filteredPositions = opts.positions.filter(({id, timestamp}) => (
		(!(paramBoats && paramBoats.length > 0) || paramBoats.includes(id.toString())) &&
		(!(paramStart) || paramStart < new Date(timestamp * 1000)) &&
		(!(paramEnd) || paramEnd > new Date(timestamp * 1000))
	))

	const filteredReports = opts.reports.filter(({boat, date}) => (
		(!(paramBoats && paramBoats.length > 0) || paramBoats.includes(boat)) &&
		(!(paramStart) || paramStart < new Date(date)) &&
		(!(paramEnd) || paramEnd > new Date(date))
	))
	filteredReports.forEach(o => {
		o.fullName = o.name + ' ('+o.boat+')'
	})
	filteredPositions.forEach(o => {
		o.fullName = o.name + ' ('+o.id+')'
	})
	return Object.assign({}, opts, {
		reports: filteredReports,
		positions: filteredPositions
	})
};

console.log({paramBoats})
Plotly.d3.json('./data.json', (err, json1) => {
	const json = filterWithParams(json1, {paramBoats, paramStart, paramEnd})

	if (err) {
		console.log('err', err);
	} else {

		const data1 = require('./speed-progress-data.js')(json, {xaxis: 'x', yaxis: 'y', showlegend: true});
		const data2 = require('./dist-to-first-progress-data.js')(json, {xaxis: 'x2', yaxis: 'y2'});
		const {shapesLayout, shapesData} = require('./progress-cues')(json, {
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
					text: 'Progression (%)'
				},
				anchor: 'y2'
			},
			yaxis: {
				domain: [0.52, 1],
				title: {
					text: 'Vitesse (bateau/VMG)<br>(noeuds)',
					font: {
						size: 10
					}
				},
				anchor: 'x'
			},
			yaxis2: {
				domain: [0, 0.48],
				title: {
					text: 'Distance au premier<br>(nm)',
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
			title: 'Vendée Globe 2020, graphiques'
		};
		var config = {responsive: true}

		Plotly.newPlot('my-div', data1.concat(data2).concat(shapesData), layout, config);
		const spinner = document.getElementById('spinner')
		spinner.remove();
	}
});
