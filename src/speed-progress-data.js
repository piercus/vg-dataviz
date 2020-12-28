const uniq = require('./uniq');
const unpack = require('./unpack');

module.exports = function ({reports, route, positions}, {xaxis = 'x', yaxis = 'y', showlegend = false}) {
	const fullNames = uniq(reports, 'fullName').filter(n => typeof (n) === 'string');

	const data2 = fullNames.map(fullName => {
		const filtered = positions.filter(r => {
			return r.fullName === fullName;
		});
		if(filtered.length === 0){
			return null
		}
		const x = unpack(filtered, r => {
			const number = r.progress * 100;
			if (Number.isNaN(number)) {
				console.log('NaN', number, r.progress, {fullName});
			}

			return number;
		});
		const speed = unpack(filtered, 'knots');
		const vmg = unpack(filtered, 'vmg');
		const text1 = unpack(filtered, (r, i) => {
			return fullName + '<br>' + (new Date(r.timestamp * 1000)).toLocaleString() + '<br>progress:' + x[i].toFixed(1) + ' %<br>speed: ' + speed[i] + ' knts<br>vmg: ' + vmg[i] + ' knts';
		});
		const color = unpack(filtered, 'color');
		return {
			type: 'scatter',
			y: speed.concat(vmg.reverse()),
			x: x.concat(x.concat().reverse()),
			xaxis,
			yaxis,
			showlegend,
			marker: {
				color: color[0].toLowerCase()
			},
			text: text1.concat(text1.concat().reverse()),
			fill: 'toself',
			hoveron: 'points+fills',
			name: fullName,
			legendgroup: fullName,
			hoverinfo: 'text'
		};
	}).filter(a => a!== null);

	return data2;
};
