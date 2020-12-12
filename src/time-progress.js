const Plotly = require('plotly.js-dist');
const uniq = require('./uniq');
const unpack = require('./unpack');

const totalDist = 24296.5;
const equateurDist = 21296.9;

const vPoints = [{
	name: 'Cabo Touriñán',
	dist: 23927
}, {
	dist: 23278.1,
	name: 'Madeira'
}, {
	dist: 23021,
	name: 'Canary Islands'
}, {
	dist: 22282,
	name: 'Cap verde'
}, {
	dist: 21296.9,
	name: 'Equator'
}];

module.exports = function ({reports, route, positions, tagId = 'myDiv'}) {
	const names = uniq(reports, 'name');
	const data = names.map(name => {
		const filtered = positions.filter(r => {
			return r.name === name;
		});

		const y = unpack(filtered, r => {
			// Console.log(r.progress*100)
			return r.progress * 100;
		});

		const x = unpack(filtered, (r, i) => {
			// Console.log(new Date(r.timestamp*1000))
			return new Date(r.timestamp * 1000).toLocaleString();
		});

		return {
			type: 'scatter',
			y,
			x,
			text: unpack(filtered, (r, i) => {
				return (new Date(r.timestamp * 1000)).toLocaleString() + '<br>progress:' + y[i].toFixed(1) + ' %<br>latitude: ' + r.latitude + '<br>longitude: ' + r.longitude + '<br>routeIndex: ' + r.routeIndex;
			}),
			name
		};
	});

	const layout = {
		xaxis: {
			title: 'Time'
		},
		yaxis: {
			title: 'Progress (%)'
		},
		title: 'Time vs Progress'
	};

	Plotly.newPlot(tagId, data, layout);
};
