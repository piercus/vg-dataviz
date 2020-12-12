const uniq = require('./uniq');
const unpack = require('./unpack');

module.exports = function ({reports, route, positions}, {xaxis = 'x', yaxis = 'y', showlegend = false}) {
	const names = uniq(reports, 'name').filter(n => typeof (n) === 'string');

	const data2 = names.map(name => {
		const filtered = positions.filter(r => {
			return r.name === name;
		});

		const x = unpack(filtered, r => {
			const number = r.progress * 100;
			if (Number.isNaN(number)) {
				console.log('NaN', number, r.progress, {name});
			}

			return number;
		});
		const speed = unpack(filtered, 'knots');
		const vmg = unpack(filtered, 'vmg');
		const text1 = unpack(filtered, (r, i) => {
			return name + '<br>' + (new Date(r.timestamp * 1000)).toLocaleString() + '<br>progress:' + x[i].toFixed(1) + ' %<br>speed: ' + speed[i] + ' knts<br>vmg: ' + vmg[i] + ' knts';
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
			name,
			legendgroup: name,
			hoverinfo: 'text'
		};
	});

	return data2;
};
