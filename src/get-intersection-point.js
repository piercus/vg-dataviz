const {getDistance, getRhumbLineBearing, getLatitude, getLongitude, toRad, toDeg} = require('geolib');
const getBarycenter = require('./get-barycenter');

const robustAcos = value => {
	if (value > 1) {
		return 1;
	}

	if (value < -1) {
		return -1;
	}

	return value;
};

// Returns the projection point from a point to a line
module.exports = (
	point,
	lineStart,
	lineEnd
) => {
	const d1 = getDistance(lineStart, point);
	const d2 = getDistance(point, lineEnd);
	const d3 = getDistance(lineStart, lineEnd);

	const directionLine = getRhumbLineBearing(lineStart, lineEnd);
	const directionPoint = getRhumbLineBearing(point, lineEnd);
	const side = (directionLine - directionPoint + 360) % 360 < 180;
	if (d1 === 0) {
		return {
			intersection: lineStart,
			distance: 0,
			directionLine,
			side: side ? 'left' : 'right',
			ratio: 1
		};
	}

	// Alpha is the angle between the line from start to point, and from start to end
	const alpha = Math.acos(
		robustAcos((d1 * d1 + d3 * d3 - d2 * d2) / (2 * d1 * d3))
	);

	// Beta is the angle between the line from end to point and from end to start //
	const beta = Math.acos(
		robustAcos((d2 * d2 + d3 * d3 - d1 * d1) / (2 * d2 * d3))
	);
		// Console.log({alpha, beta, d1, d2, d3})

	// if the angle is greater than 90 degrees, then the minimum distance is the
	// line from the start to the point
	// if (alpha >= Math.PI / 2) {
	//
	//     return {
	// 			intersection: lineStart,
	// 			side: side ? 'left' : 'right',
	// 			distance: d1,
	// 			ratio: 1,
	// 			directionLine
	// 		};
	// }
	//
	// if (beta >= Math.PI / 2) {
	// 		console.log('beta >=PI/2', getBarycenter([lineStart, lineEnd], [Math.cos(beta)*d2, Math.cos(alpha)*d1]))
	//     // same for the beta
	//     return {
	// 			intersection: lineEnd,
	// 			side: side ? 'left' : 'right',
	// 			distance: d2,
	// 			ratio: 0,
	// 			directionLine
	// 		};
	// }

	// otherwise the minimum distance is achieved through a line perpendicular
	// to the start-end line, which goes from the start-end line to the point
	const ratio = 1 - Math.cos(beta) * d2 / (Math.cos(alpha) * d1 + Math.cos(beta) * d2);
	return {
		intersection: getBarycenter([lineStart, lineEnd], [Math.cos(beta) * d2, Math.cos(alpha) * d1]),
		distance: Math.sin(alpha) * d1,
		directionLine,
		side: side ? 'left' : 'right',
		ratio,
		distanceToStart: Math.abs(ratio * d3),
		distanceToEnd: Math.abs((1 - ratio) * d3)
	};
};
