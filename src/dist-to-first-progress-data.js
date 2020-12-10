const uniq = require('./uniq');
const unpack = require('./unpack')

module.exports = function({reports, route, positions}, {xaxis='x', yaxis='y', showlegend=false}){
  const names = uniq(reports, 'name').filter(n => typeof(n) === 'string');

  return names.map(name => {
    const filtered = positions.filter(r => {
      return r.name === name
    });

    const x = unpack(filtered, r => {
      const num = r.progress*100;
      return num
    });
    const distToFirst = unpack(filtered, ({distToFirst}) => {
      return distToFirst/1852;
    });
    const text1 = unpack(filtered, (r,i) => {
      return name+'<br>'+(new Date(r.timestamp*1000)).toLocaleString()+"<br>distToFirst: "+distToFirst[i].toFixed(1)+' nm';
    });
    const color = unpack(filtered, 'color');
    console.log({color})
    return {
      type: 'scatter',
      y: distToFirst,
      x: x,
      showlegend,
      xaxis,
      yaxis,
      marker: {
        color: color[0].toLowerCase()
      },
      legendgroup: name,
      text: text1,
      name,
      hoverinfo: 'text'
    }
  });
}
