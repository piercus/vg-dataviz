const uniq = require('./uniq');
const unpack = require('./unpack');

module.exports = function ({reports, route, positions}, {paramBoats=null,xaxis = 'x', yaxis = 'y', showlegend = false}) {
	const filteredReports = reports.filter(({boat}) => !(paramBoats && paramBoats.length > 0) || paramBoats.includes(boat))
	const fullNames = uniq(filteredReports, 'fullName').filter(n => typeof (n) === 'string');

	return fullNames.map(fullName => {
		const filtered = positions.filter(r => {
			return r.fullName === fullName;
		});
		if(filtered.length === 0){
			return null
		}

		const x = unpack(filtered, r => {
			const number = r.progress * 100;
			return number;
		});
		const distToFirst = unpack(filtered, ({distToFirst}) => {
			return distToFirst / 1852;
		});
		const text1 = unpack(filtered, (r, i) => {
			return fullName + '<br>' + (new Date(r.timestamp * 1000)).toLocaleString() + '<br>distToFirst: ' + distToFirst[i].toFixed(1) + ' nm';
		});
		const color = unpack(filtered, 'color');
		return {
			type: 'scatter',
			y: distToFirst,
			x,
			showlegend,
			xaxis,
			yaxis,
			marker: {
				color: color[0].toLowerCase()
			},
			legendgroup: fullName,
			text: text1,
			name: fullName,
			hoverinfo: 'text'
		};
	}).filter(a => a!== null);
};
