var Plotly = require('plotly.js-dist');

Plotly.d3.csv('./positions.csv', function(err, rows){

  const names = uniq(rows, 'name');

  const data = names.map(name => {
    const filtered = rows.filter(r => {
      return r.name === name
    });
    const x = unpack(filtered, r => {
      const num = parseInt(r.timestamp)
      if(Number.isNaN(num)){
        console.log('NaN', num)
      }
      
      return new Date(num*1000)
    });
    return {
      type: 'scatter',
      connectgaps: false,
      y: unpack(filtered, r => r.knots),
      x,
      name
    }
  });
  
  Plotly.newPlot('myDiv2', data);
})