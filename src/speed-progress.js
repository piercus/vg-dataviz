var Plotly = require('plotly.js-dist');
const uniq = require('./uniq');
const unpack = require('./unpack')

const totalDist = 24296.5
const equateurDist = 21296.9;

const vPoints = [{
    name: 'Cabo Touriñán',
    dist: 23927
  },{
    dist: 23278.1,
    name: 'Madeira'
  },{
    dist: 23021,
    name: 'Canary Islands'
  },{
    dist: 22282,
    name: 'Cap verde'
  },{
    dist: 21296.9,
    name: 'Equator'
}];

module.exports = function({reports, route, positions, tagId = 'myDiv'}){
  const names = uniq(reports, 'name').slice(0,3);
  const data = names.map(name => {
    const filtered = reports.filter(r => {
      return r.name === name && parseFloat(r.dtf) <= totalDist && r.dtf !== 0
    });

    const x = unpack(filtered, r => {
      const num = (totalDist - parseFloat(r.dtf))/totalDist*100;
      if(Number.isNaN(num)){
        console.log('NaN', num)
      }
      return num
    });
    const speed = unpack(filtered, 'speed');
    const vmg = unpack(filtered, 'vmg');
    const text1 = unpack(filtered, (r,i) => {
      return (new Date(r.date)).toLocaleString()+"<br>progress:"+x[i].toFixed(1)+' %<br>speed: '+speed[i]+' knts<br>vmg: '+vmg[i]+' knts';
    });
    return {
      type: 'scatter',
      y: speed.concat(vmg.reverse()),
      x: x.concat(x.concat().reverse()),
      text: text1.concat(text1.concat().reverse()),
      fill: 'toself',
      hoveron: 'points+fills',
      name,
      hoverinfo: 'text'
    }
  });

  const data2 = names.map(name => {
    const filtered = positions.filter(r => {
      return r.name === name
    });

    const x = unpack(filtered, r => {
      const num = r.progress*100;
      if(Number.isNaN(num)){
        console.log('NaN', num)
      }
      return num
    });
    const speed = unpack(filtered, 'knots');
    const vmg = unpack(filtered, 'vmg');
    const text1 = unpack(filtered, (r,i) => {
      console.log(new Date(r.timestamp*1000))
      return (new Date(r.timestamp*1000)).toLocaleString()+"<br>progress:"+x[i].toFixed(1)+' %<br>speed: '+speed[i]+' knts<br>vmg: '+vmg[i]+' knts';
    });
    return {
      type: 'scatter',
      y: speed.concat(vmg.reverse()),
      x: x.concat(x.concat().reverse()),
      text: text1.concat(text1.concat().reverse()),
      fill: 'toself',
      hoveron: 'points+fills',
      name,
      hoverinfo: 'text'
    }
  });


  const shapes = [];
  vPoints.forEach(({dist, name}) => {
    const x = (totalDist-dist)/totalDist*100;
    data.push({
      type: 'scatter',
      y: [-1],
      x: [x],
      text: [name],
      showlegend: false,
      mode: 'text',
      hovermode: false
    });

    shapes.push({
      type: 'line',
      x0: x,
      y0: 0,
      x1: x,
      y1: 25,
      line: {
        color: 'grey',
        width: 2,
        dash: 'dot'
      }
    })

  })


  const layout = {
    xaxis: {
      title: 'Progress (%)'
    },
    yaxis: {
      title: 'VMG (under) and boat (over) in knots'
    },
    shapes,
    title: 'Speed vs Progress'
  };

  Plotly.newPlot(tagId, data.concat(data2), layout);
}
