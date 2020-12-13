const totalDist = 24296.5;
const equateurDist = 21296.9;

const vPoints = [{
	name: 'Cap Touriñan',
	dist: 23927
}, {
	dist: 22282,
	name: 'Cap Vert'
}, {
	dist: 21296.9,
	name: 'Equateur'
}, {
	dist: 17770,
	name: 'Cap de Bonne Espérance'
}, {
	dist: 15265,
	name: 'Kerguelen'
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
