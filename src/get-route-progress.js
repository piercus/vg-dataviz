const getIntersectionPoint = require('./get-intersection-point')
const {getDistance, getRhumbLineBearing} = require('geolib');


// Returns the projection point from a point to a line
module.exports = ({
    point,
    route,
    currentRouteIndex = 0,
    routeRange = 100
}) => {
    let current = 0;
    const routeDistances = [0].concat(route.slice(1).map((_,i) => {
      const distance = getDistance(route[i], route[i+1]);
      current = distance+current;
      return current;
    }));

    const infos = route
      .map(l => getDistance(l, point))
      .map((value, index) => ({value, index}))
      .filter(({index}) => Math.abs(currentRouteIndex-index) <= routeRange)
      .map(({value, index}) => ({distance: value, point: route[index], index}));

    const sorted = infos.sort((a,b) => a.distance - b.distance);

    const closests = sorted.sort((a,b) => a.index - b.index);

    // if(closests[0].index+1 !== closests[1].index || closests[0].index+2 !== closests[2].index){
    //   console.log(closests, currentRouteIndex, routeRange)
    //   throw(new Error('invalid path projections'))
    // }

    const all = closests.slice(1)
      .map((_, i) => {
        return {
          intersec: getIntersectionPoint(
            point,
            closests[i].point,
            closests[i+1].point
          ),
          index: i
        }
      })
    const best = all
      .reduce((a, b) => {
        return a.intersec.distance < b.intersec.distance ? a : b;
      });
    console.log(all)
    const result = best.intersec;
    const {intersection, ratio, distance, side} = result;
    if(typeof(intersection) === 'undefined' || typeof(intersection) !== 'object' ){
      throw(new Error('invalid intersection'))
    }
    // otherwise the minimum distance is achieved through a line perpendicular
    // to the start-end line, which goes from the start-end line to the point
    const distanceMade = (ratio*routeDistances[closests[best.index].index]+(1-ratio)*routeDistances[closests[best.index+1].index]);
    if(Number.isNaN(distanceMade)){
      throw(new Error('nan'))
    }
    const progress = distanceMade/routeDistances[routeDistances.length - 1];
    if(progress > 1){
      console.log(progress, distanceMade, routeDistances, ratio, routeDistances[closests[best.index].index], routeDistances[closests[best.index+1].index])
      throw(new Error('invalid progress'))
    }

    return {
      progress,
      routeIndex: closests[best.index].index,
      intersection,
      routeDistance: distanceMade,
      orthoDistance: distance,
      side
    }
};
