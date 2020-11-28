const getBarycenter = require('./get-barycenter')
const getIntersectionPoint = require('./get-intersection-point')
const {getDistance, getRhumbLineBearing} = require('geolib')
const getDistanceMade = function({
	point,
  closestPointIndex,
  routeDistToFinish,
	currentRouteIndex = 0,
	routeRange = 5,
  nextPoint,
  route,
  previousPoint
}){
	let current = 0;
  const closestPoint = route[closestPointIndex];

	if(closestPointIndex === route.length-1){
    return {
      routePoint: getIntersectionPoint(
        point,
        previousPoint,
        closestPoint
      ).intersection,
      routeIndex: closestPointIndex-1
    }
	}

	if(closestPointIndex === 0){
    return {
      routePoint: getIntersectionPoint(
        point,
        closestPoint,
        nextPoint
      ).intersection,
      routeIndex: 0
    }
	}


	const previousPointDist = getDistance(point, previousPoint);
	const nextPointDist = getDistance(point, nextPoint);
	const closestPointDist = getDistance(route[closestPointIndex], point);

	const w1 = previousPointDist - closestPointDist;
	const w2 = nextPointDist - closestPointDist;
  if(w1 < 0 || w2 < 0){
    throw(new Error('closest is not closest'))
  }
	if(w1 === 0){
	  return {
      routePoint: getCenter(previousPoint, closestPoint),
			routeIndex: closestPointIndex - 1,
			distanceMade: (routeDistToFinish[closestPointIndex] + routeDistToFinish[closestPointIndex - 1])/2
		}
	} else if(w2 === 0){
		return {
      routePoint: getCenter(closestPoint, nextPoint),
			routeIndex: closestPointIndex
		}
	} else if(w1 === w2){
		return {
      routePoint: closestPoint,
			routeIndex: closestPointIndex
		}
	} else if(w1 < w2){
    const weights = [
      (w2 - w1)/w2,
      1
    ];

	  return {
      routePoint: getBarycenter([previousPoint, closestPoint], weights),
			routeIndex: closestPointIndex - 1
		}
	} else if(w2 < w1){
    const weights = [
      1,
      (w1 - w2)/w1
    ];

		return {
      routePoint: getBarycenter([closestPoint, nextPoint], weights),
			routeIndex: closestPointIndex
		}
	} else {
    console.log(w1, w2, previousPointDist, closestPointDist, previousPoint, closestPointIndex)
    throw(new Error('getDistanceMade cannot find distance'))
  }
}

module.exports = function({
	point,
	route,
	currentRouteIndex=0,
	routeRange=5
}){
  let current = 0;
  const routeDistances = [0].concat(route.slice(1).map((_,i) => {
    const distance = getDistance(route[i], route[i+1]);
    current = distance+current;
    return current;
  }));


  const totalDist = routeDistances[routeDistances.length - 1]
  const routeDistToFinish = routeDistances.map(d => totalDist - d);

  const infos = route
    .map((routePoint, index) => ({routePoint, index}))
    .filter(({index}) => Math.abs(currentRouteIndex-index) <= routeRange)
    .map(l => ({
      pointRouteDistance: getDistance(l.routePoint, point),
      routePoint: l.routePoint,
      index: l.index
    }))
    .map(({pointRouteDistance, index, routePoint}) => ({
      distToFinish: pointRouteDistance+routeDistToFinish[index],
      pointRouteDistance,
      routePoint,
      index
    }));

  const closestPointIndex = infos.reduce((a,b) => a.pointRouteDistance < b.pointRouteDistance ? a : b).index;
  let nextPoint = route[closestPointIndex+1];
  let previousPoint = route[closestPointIndex-1];

  const {routeIndex, routePoint} = getDistanceMade({
    point,
  	nextPoint,
    route,
    infos,
    previousPoint,
    closestPointIndex,
    routeDistToFinish,
  	currentRouteIndex,
  	routeRange
  })
  if(routeIndex < 0){
    throw(new Error('routeIndex should be >= 0'))
  }
  if(typeof(routePoint) === 'undefined'){
    throw(new Error('undefined route point'))
  }
  const distanceToIndex = getDistance(routePoint, route[routeIndex])

  const distanceMade = totalDist - (routeDistToFinish[routeIndex] - distanceToIndex);
  if(distanceMade > totalDist){
    throw(new Error('more than 100% progress'))
  }
  return {
    angle: getRhumbLineBearing(route[routeIndex], route[routeIndex+1]),
    routeIndex,
    routePoint,
    routeDistance: distanceMade,
    progress: distanceMade/totalDist
  }
}
