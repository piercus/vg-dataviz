const test = require('ava');
const {getDistance, getRhumbLineBearing} = require('geolib')
const getRouteProgress = require('../src/get-route-progress')
const route = [{
	"latitude":46.42661,
	"longitude":-1.73589
},{
	"latitude":44.63857,
	"longitude":-7.88044
},{
	"latitude":36.73942,
	"longitude":-17.32819
},{"latitude":9.16335,"longitude":-28.48869},{"latitude":-30.16935,"longitude":-22.33044},{"latitude":-38.69362,"longitude":15.6315},{"latitude":-44.27657,"longitude":55.54419},{"latitude":-45.27746,"longitude":85.28994},{"latitude":-43.43518,"longitude":111.65364},{"latitude":-46.86975,"longitude":140.88656},{"latitude":-50.48668,"longitude":-168.97053},{"latitude":-49.83963,"longitude":-119.35556},{"latitude":-54.50021,"longitude":-90.43525},{"latitude":-56.1663,"longitude":-67.01964},{"latitude":-50.94474,"longitude":-61.56453},{"latitude":-37.31959,"longitude":-47.25903},{"latitude":-15.63266,"longitude":-34.14494},{"latitude":13.57691,"longitude":-29.66311},{"latitude":39.88757,"longitude":-16.8385},{"latitude":46.42661,"longitude":-1.73589}];
test('Route progress 1', t => {
	const pointBefore = {
		latitude: 30.30352000000008,
  	longitude: -27.392000000000003
	};
	const pointAfter = {
		"latitude":30.22448000000008,"longitude":-27.446540000000002
	}
	const opts = {
		"currentRouteIndex":2,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	const dist = getDistance(pointBefore, pointAfter);
	const dist2 = getDistance(res1.routePoint, res2.routePoint);
	t.true(diff/1000 < 200);
	console.log({diff, dist});
})

test('Route progress 2', t => {
	const pointBefore = {
		latitude: -11.169839999999958,
		longitude: -31.111620000000013
	};
	const pointAfter = {
		latitude: -11.321779999999958,
		longitude: -31.099950000000014,
	};
	const opts = {
		"currentRouteIndex":2,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts))
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);

	// console.log(res1.routePoint, res2.routePoint)

	const dist = getDistance(pointBefore, pointAfter);
	console.log({dist, dist})
	t.true(Math.abs(res1.routePoint.latitude - res2.routePoint.latitude) < 1);

	t.true(diff/1000 < 200);
})


test('Route progress 3', t => {
	const pointBefore = { longitude: -28.421339325079288, latitude: 9.362707808278092 };
	const opts = {
		"currentRouteIndex":3,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const pointAfter = {"latitude":9.019340000000003,"longitude":-27.729469999999992};
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts))

	const dist = getDistance(pointBefore, pointAfter)
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	const vmg = diff/1800*1.94384
	console.log({diff, dist})
	t.true(diff < dist);
});
//

test('Route progress 4', t => {
	const pointBefore = {  latitude: 46.28284000000001,
  longitude: -5.250430000000001 };
	const opts = {
		"currentRouteIndex":0,
		"routeRange":5,
		route
	};
	const opts2 = {
		"currentRouteIndex":1,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const pointAfter = {
		latitude: 46.327290000000005,
		longitude: -5.3180
	};
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts2))

	const dist = getDistance(pointBefore, pointAfter)
	const diff = Math.abs(res2.routeDistance - res1.routeDistance);
	const angle2 = getRhumbLineBearing(pointBefore, pointAfter)
	t.true(diff < dist);

});

const macroBasicRoute = function(t, point1, point2, expected){

	const basicRoute = [{
			"latitude":-1,
			"longitude":0
		},{
			"latitude":0,
			"longitude":0
		},{
			"latitude":1,
			"longitude":0
	}];

	const opts = {
		route: basicRoute
	};

	const res1 = getRouteProgress(Object.assign({point: point1}, opts));
	const res2 = getRouteProgress(Object.assign({point: point2}, opts))

	const dist = getDistance(point1, point2)
	const diff = Math.abs(res2.routeDistance - res1.routeDistance);

	t.true(diff <= dist, `Expecting real distance (${dist}) >= route Distance (${diff})`);
	t.true(Math.abs(diff - expected) < 1e-8, `Expecting route Distance (${diff}) to be close to ${expected}`);
}

test('orthogonal basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: -0.5, longitude: 1.5}, 0);
test('parallel basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: 0.5, longitude: 1}, 1);
test('parallel small basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: -0.2, longitude: 1}, 0.3);
test('on the line basic',macroBasicRoute, {latitude: -1, longitude: 0}, {latitude: 0.2, longitude: 0}, 133583);
