const getBarycenter = require('./get-barycenter')
const getIntersectionPoint = require('./get-intersection-point')
const {getDistance, getRhumbLineBearing, getCenter} = require('geolib')
const getDistanceMade = function({
	point,
  closestPointIndex,
  routeDistToFinish,
  getDistances,
	currentRouteIndex = 0,
	routeRange = 5,
  nextPoint,
  routeDistances,
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

  if(nextPointDist < closestPointDist){
    throw(new Error('not closest point (next)'))
  }
  if(previousPointDist < closestPointDist){
    throw(new Error('not closest point (previous)'))
  }
  const intersectionBefore = getIntersectionPoint(
    point,
    previousPoint,
    closestPoint
  )

  const intersectionAfter = getIntersectionPoint(
    point,
    closestPoint,
    nextPoint
  )

  // console.log({intersectionAfter, intersectionBefore})

  const ratioBefore = intersectionBefore.ratio;
  const ratioAfter = intersectionAfter.ratio;



  // console.log({distanceMadeBefore, distanceMadeAfter})

  if(ratioAfter < 0 && ratioBefore <= 1){
    return {
      routePoint: intersectionBefore.intersection,
      routeIndex: closestPointIndex - 1
    }
  } else if(ratioAfter >= 0 && ratioBefore > 1){
    return {
      routePoint: intersectionAfter.intersection,
      routeIndex: closestPointIndex,
    }
  } else if(ratioAfter < 0 && ratioBefore > 1){
    return {
      routePoint: closestPoint,
      routeIndex: closestPointIndex,
    }
  } else if(ratioAfter >= 0 && ratioBefore <= 1){
    const weights = [
      (1-ratioBefore)/(previousPointDist-closestPointDist),
      ratioAfter/(nextPointDist - closestPointDist)
    ];

    if(weights[0] > weights[1]){
      const middlePoint = getCenter([previousPoint, closestPoint]);
      return {
        routePoint: getBarycenter([middlePoint, closestPoint], [weights[0], 1]),
        routeIndex: closestPointIndex-1,
      }
    } else {
      const middlePoint = getCenter([nextPoint, closestPoint]);
      return {
        routePoint: getBarycenter([closestPoint, middlePoint], [1, weights[1]]),
        routeIndex: closestPointIndex,
      }
    }
  } else {
    throw(new Error('should not occurs'))
  }
  // return {
  //   routePoint: getIntersectionPoint(
  //     point,
  //     closestPoint,
  //     nextPoint
  //   ).intersection,
  //   routeIndex: 0
  // }
  // if(w1 < 0 || w2 < 0){
  //   throw(new Error('closest is not closest'))
  // }
	// if(w1 === 0){
	//   return {
  //     routePoint: getCenter(previousPoint, closestPoint),
	// 		routeIndex: closestPointIndex - 1,
	// 		distanceMade: (routeDistToFinish[closestPointIndex] + routeDistToFinish[closestPointIndex - 1])/2
	// 	}
	// } else if(w2 === 0){
	// 	return {
  //     routePoint: getCenter(closestPoint, nextPoint),
	// 		routeIndex: closestPointIndex
	// 	}
	// } else if(w1 === w2){
	// 	return {
  //     routePoint: closestPoint,
	// 		routeIndex: closestPointIndex
	// 	}
	// } else if(w1 < w2){
  //   const weights = [
  //     (w2 - w1)/w2,
  //     1
  //   ];
  //
	//   return {
  //     routePoint: getBarycenter([previousPoint, closestPoint], weights),
	// 		routeIndex: closestPointIndex - 1
	// 	}
	// } else if(w2 < w1){
  //   const weights = [
  //     1,
  //     (w1 - w2)/w1
  //   ];
  //
	// 	return {
  //     routePoint: getBarycenter([closestPoint, nextPoint], weights),
	// 		routeIndex: closestPointIndex
	// 	}
	// } else {
  //   console.log(w1, w2, previousPointDist, closestPointDist, previousPoint, closestPointIndex)
  //   throw(new Error('getDistanceMade cannot find distance'))
  // }
}

module.exports = function({
	point,
	route,
	currentRouteIndex=0,
	routeRange=5
}){
  let current = 0;
  const routeDistances = route.slice(1).map((_,i) => {
    return getDistance(route[i], route[i+1]);
  });
  const routeCumDistances = [0].concat(route.slice(1).map((_,i) => {
    const distance = getDistance(route[i], route[i+1]);
    current = distance+current;
    return current;
  }));


  const totalDist = routeDistances.reduce((a,b) => a+b, 0)
  const routeDistToFinish = routeCumDistances.map(d => totalDist - d);

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

  // console.log(infos[closestPointIndex].pointRouteDistance)
  const {routeIndex, routePoint} = getDistanceMade({
    point,
  	nextPoint,
    routeDistances,
    route,
    infos,
    previousPoint,
    closestPointIndex,
    routeDistToFinish,
  	currentRouteIndex,
  	routeRange
  })
  if(Number.isNaN(routePoint.latitude)){
    throw(new Error('routePoint is NaN'))
  }
  if(routeIndex < 0){
    throw(new Error('routeIndex should be >= 0'))
  }
  if(typeof(routePoint) === 'undefined'){
    throw(new Error('undefined route point'))
  }
  const distanceToIndex = getDistance(routePoint, route[routeIndex])
  // console.log({distanceToIndex, routePoint, point})

  const distanceMade = totalDist - (routeDistToFinish[routeIndex] - distanceToIndex);
  if(distanceMade > totalDist){
    throw(new Error('more than 100% progress'))
  }
  if(Number.isNaN(distanceMade)){
    throw(new Error('distanceMade is NaN'))
  }
  // console.log({routePoint})
  return {
    angle: getRhumbLineBearing(route[routeIndex], route[routeIndex+1]),
    routeIndex,
    routePoint,
    routeDistance: distanceMade,
    progress: distanceMade/totalDist
  }
}
