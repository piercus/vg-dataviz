const totalDist = 24296.5;
const equateurDist = 21296.9;

const vPoints = [{
	name: 'Cabo Touriñán',
	dist: 23927
}, {
	dist: 23021,
	name: 'Canary Islands'
}, {
	dist: 22282,
	name: 'Cap verde'
}, {
	dist: 21296.9,
	name: 'Equator'
}, {
	dist: 17770,
	name: 'Cap Bonne Espérance'
}];
const shapesLayout = [];
const shapesData = [];

module.exports = function ({configs}) {
	vPoints.forEach(({dist, name}, vPointId) => {
  	const x = (totalDist - dist) / totalDist * 100;

		configs.map(({xaxis = 'x', yaxis = 'y', ymax, showlegend = false}) => {
			if (showlegend) {
				shapesData.push({
					type: 'scatter',
					y: [vPointId % 2 === 0 ? -ymax / 10 : -2 * ymax / 10],
					x: [x],
					xaxis,
					yaxis,
					text: [name],
					showlegend: false,
					mode: 'text',
					hovermode: false
				});
			}

			shapesLayout.push({
    		type: 'line',
    		x0: x,
    		y0: 0,
    		x1: x,
    		y1: ymax,
				xref: xaxis,
				yref: yaxis,
    		line: {
    			color: 'grey',
    			width: 2,
    			dash: 'dot'
    		}
    	});
		});
	});
	return {shapesLayout, shapesData};
};
