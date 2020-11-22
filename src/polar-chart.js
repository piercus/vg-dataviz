var Plotly = require('plotly.js-dist');


const colors = [{
    max: 2.5,
    r:255,g:255,b:255,a:0.18
  },{
    r:21,g:200,b:232,a:0.44999999999999996,
      max: 7.5
  },{
    r:19,g:234,b:186,a:0.8999999999999999,
      max: 12.5
  },{
    r:19,g:234,b:186,a:0.8999999999999999,
      max: 17.5
  },{
    r:211,g:239,b:14,a:0.8999999999999999,
      max: 22.5
  },{
    r:211,g:239,b:14,a:0.8999999999999999,
      max: 27.5    
  },{
    r:232,g:100,b:21,a:0.8999999999999999,
      max: 32.5
  },{
    r:180,g:8,b:0,a:0.8999999999999999,
      max: 37.5
  },{
    r:147,g:4,b:0,a:0.8999999999999999,
      max: 42.5
  },{
    r:148,g:4,b:161,a:0.8999999999999999,
      max: 47.5
  },{
    r:71,g:0,b:119,a:0.8999999999999999,
      max: null                                  
}];

Plotly.d3.csv('./data.csv', function(err, rows){

  const names = uniq(rows, 'name');

  const data = names.map(name => {
    const filtered = rows.filter(r => {
      return r.name === name && r.racestatus === 'RAC' && r.meanSeaLevelPressure !== '0'
    });
    return {
      type: "scatterpolar",
      r: unpack(filtered, r => r.speed),
      theta: unpack(filtered, r => {
        let res = (parseInt(r.heading, 10) - parseInt(r.wind10mDirection, 10)+360)%360;
        if(res > 180){
          res = 360 - res;
        }
        return 180 - res;
      }),
      text: unpack(filtered, r => {
        return r.date+', boat: '+r.heading+'°, wind: '+r.wind10mDirection+'° '+r.wind10mSpeed+'knts';
      }),
      mode: "markers",
      marker: {color: unpack(filtered, r => {
        const selectedColor = colors.filter(c => c.max === null || c.max > parseInt(r.wind10mSpeed))[0];
        return 'rgb('+selectedColor.r+','+selectedColor.g+','+selectedColor.b+')';
      })},
      name
    }
  });

	var layout = {
	    title: "Vendée Globe Polar Chart",
	    font: {
	      size: 15
	    },
	    showlegend: true,
	    polar: {
				sector: [-90,90],
	      bgcolor: "rgb(223, 223, 223)",
	      angularaxis: {
	        tickwidth: 2,
	        linewidth: 3,
	        layer: "below traces",
					rotation: -90,
	      }
	    }
	  }

		Plotly.newPlot('myDiv', data, layout);



  var myPlot = document.getElementById('myDiv');
  var hoverInfo = document.getElementById('hoverinfo');

  Plotly.newPlot('myDiv', data, layout);
})