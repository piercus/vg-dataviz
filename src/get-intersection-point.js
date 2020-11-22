const {getDistance, getRhumbLineBearing, getLatitude, getLongitude, toRad, toDeg} = require('geolib');

const robustAcos = (value) => {
    if (value > 1) {
        return 1;
    }
    if (value < -1) {
        return -1;
    }

    return value;
};

const getBarycenter = (points, weights) => {
    if (
			Array.isArray(points) === false
			|| points.length === 0
			|| Array.isArray(weights) === false
			|| weights.length !== points.length
		) {

        return false;
    }

    const totalWeight = weights.reduce((a,b) => a + b, 0);

    const sum = points.map((a, i) => ({point: a, weight: weights[i]})).reduce(
        (acc, {point, weight}) => {
            const pointLat = toRad(getLatitude(point));
            const pointLon = toRad(getLongitude(point));

            return {
                X: acc.X + Math.cos(pointLat) * Math.cos(pointLon) * weight,
                Y: acc.Y + Math.cos(pointLat) * Math.sin(pointLon) * weight,
                Z: acc.Z + Math.sin(pointLat) * weight,
            };
        },
        { X: 0, Y: 0, Z: 0 }
    );

    const X = sum.X / totalWeight;
    const Y = sum.Y / totalWeight;
    const Z = sum.Z / totalWeight;

    return {
        longitude: toDeg(Math.atan2(Y, X)),
        latitude: toDeg(Math.atan2(Z, Math.sqrt(X * X + Y * Y))),
    };
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
		const side = (directionLine - directionPoint + 360)%360 < 180;

    // alpha is the angle between the line from start to point, and from start to end
    const alpha = Math.acos(
        robustAcos((d1 * d1 + d3 * d3 - d2 * d2) / (2 * d1 * d3))
    );

    // beta is the angle between the line from end to point and from end to start //
    const beta = Math.acos(
        robustAcos((d2 * d2 + d3 * d3 - d1 * d1) / (2 * d2 * d3))
    );

    // if the angle is greater than 90 degrees, then the minimum distance is the
    // line from the start to the point
    if (alpha >= Math.PI / 2) {

        return {
					intersection: lineStart,
					side: side ? 'left' : 'right',
					distance: d1,
					ratio: 1
				};
    }

    if (beta >= Math.PI / 2) {
        // same for the beta
        return {
					intersection: lineEnd,
					side: side ? 'left' : 'right',
					distance: d2,
					ratio: 0
				};
    }

    // otherwise the minimum distance is achieved through a line perpendicular
    // to the start-end line, which goes from the start-end line to the point
    return {
			intersection: getBarycenter([lineStart, lineEnd], [Math.cos(beta)*d2, Math.cos(alpha)*d1]),
			distance: Math.sin(alpha) * d1,
			side: side ? 'left' : 'right',
			ratio: Math.cos(beta)*d2/(Math.cos(alpha)*d1+Math.cos(beta)*d2)
		};
};
