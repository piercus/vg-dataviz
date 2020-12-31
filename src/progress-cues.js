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
}, {
	dist: 13511,
	name: 'Cap Leeuwin'
}, {
	dist: 8896,
	name: 'Point Nemo'
}];
const shapesLayout = [];
const shapesData = [];

module.exports = function (json, {configs}) {
	vPoints.forEach(({dist, name}, vPointId) => {
  	const x = (totalDist - dist) / totalDist * 100;
		const minProgress = Math.min(...json.positions.map(({progress}) => progress))*100
		const maxProgress = Math.max(...json.positions.map(({progress}) => progress))*100

		if(x < minProgress || x > maxProgress){
			return
		}
		configs.map(({xaxis = 'x', yaxis = 'y', ymax, ymin=0, showlegend = false}) => {

			if (showlegend) {
				shapesData.push({
					type: 'scatter',
					y: [vPointId % 2 === 0 ? -ymax / 10 + ymin : -2 * ymax / 10 + ymin],
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
    		y0: ymin,
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
