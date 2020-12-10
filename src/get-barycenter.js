const {getLatitude, getLongitude, toRad, toDeg} = require('geolib');

module.exports = (points, weights) => {
    if (
			Array.isArray(points) === false
			|| points.length === 0
			|| Array.isArray(weights) === false
			|| weights.length !== points.length
		) {
			throw(new Error('invalid input of barycenter'))
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
		if(Number.isNaN(X)){
			throw(new Error('X is NaN'))
		}
    return {
        longitude: toDeg(Math.atan2(Y, X)),
        latitude: toDeg(Math.atan2(Z, Math.sqrt(X * X + Y * Y))),
    };
};
