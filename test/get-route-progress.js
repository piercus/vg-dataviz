const test = require('ava');
const {getDistance, getRhumbLineBearing} = require('geolib')
const getRouteProgress = require('../src/get-route-progress')

const realRoute = [{
	"latitude":46.42661,"longitude":-1.73589
},{
	"latitude":44.63857,"longitude":-7.88044
},{"latitude":36.73942,"longitude":-17.32819},{"latitude":9.16335,"longitude":-28.48869},{"latitude":-30.16935,"longitude":-22.33044},{"latitude":-41.057,"longitude":2.87582},{"latitude":-40.31358,"longitude":48.21896},{"latitude":-46.70372,"longitude":73.95425},{"latitude":-43.43518,"longitude":111.65364},{"latitude":-47.86748,"longitude":138.41503},{"latitude":-53.47095,"longitude":-178.6904},{"latitude":-51.09225,"longitude":-137.15202},{"latitude":-54.50021,"longitude":269.56475},{"latitude":-56.1663,"longitude":292.98036},{"latitude":-50.94474,"longitude":298.43547},{"latitude":-37.31959,"longitude":312.74097},{"latitude":-15.63266,"longitude":325.85506},{"latitude":13.57691,"longitude":330.33689},{"latitude":39.88757,"longitude":343.1615},{"latitude":46.42661,"longitude":358.26411}]


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
		route: realRoute
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	const dist = getDistance(pointBefore, pointAfter);
	const dist2 = getDistance(res1.routePoint, res2.routePoint);
	t.true(diff/1000 < 200);
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
		route: realRoute
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts))
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);

	// console.log(res1.routePoint, res2.routePoint)

	const dist = getDistance(pointBefore, pointAfter);
	t.true(Math.abs(res1.routePoint.latitude - res2.routePoint.latitude) < 1);

	t.true(diff/1000 < 200);
})


test('Route progress 3', t => {
	const pointBefore = { longitude: -28.421339325079288, latitude: 9.362707808278092 };
	const opts = {
		"currentRouteIndex":3,
		"routeRange":5,
		route: realRoute
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const pointAfter = {"latitude":9.019340000000003,"longitude":-27.729469999999992};
	const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts))

	const dist = getDistance(pointBefore, pointAfter)
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	const vmg = diff/1800*1.94384
	// console.log({diff, dist, res1, res2})
	t.true(diff < dist);
});
//

test('Route progress 4', t => {
	const pointBefore = {  latitude: 46.28284000000001,
  longitude: -5.250430000000001 };
	const opts = {
		"currentRouteIndex":0,
		"routeRange":5,
		route: realRoute
	};
	const opts2 = {
		"currentRouteIndex":1,
		"routeRange":5,
		route: realRoute
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
const defaultRoute = [{
		"latitude":-1,
		"longitude":0
	},{
		"latitude":0,
		"longitude":0
	},{
		"latitude":1,
		"longitude":0
}];
const macroBasicRoute = function(t, point1, point2, expected, route=defaultRoute, routeIndex=0){



	const opts = {
		route,
		currentRouteIndex:routeIndex,
		"routeRange":3
	};

	const res1 = getRouteProgress(Object.assign({point: point1}, opts));
	const res2 = getRouteProgress(Object.assign({point: point2}, opts))

	const dist = getDistance(point1, point2)
	const diff = Math.abs(res2.routeDistance - res1.routeDistance);
	const diffProgress = Math.abs(res2.progress - res1.progress);
	const progressSign = res2.progress > res1.progress;
	t.true(diff <= dist*1.001, `Expecting real distance (${dist}) >= route Distance (${diff})`);
	if(typeof(expected) === 'number'){
		t.true(Math.abs(diffProgress - expected) < 1e-2, `Expecting route Distance (${diffProgress}) to be close to ${expected}`);
	} else if(typeof(expected) === 'boolean'){
		// console.log({route, res1, res2, point1, point2})
		t.is(progressSign, expected, `Expecting route Distance (${progressSign}) to be close to ${expected}`);
	}
}

test('orthogonal basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: -0.5, longitude: 1.5}, 0);
test('parallel basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: 0.5, longitude: 1}, 1/2);
test('parallel small basic', macroBasicRoute, {latitude: -0.5, longitude: 1}, {latitude: -0.2, longitude: 1}, 0.3/2);
test('on the line basic',macroBasicRoute, {latitude: -1, longitude: 0}, {latitude: 0.2, longitude: 0}, 1.2/2);

test('real-life',
	macroBasicRoute,
	{latitude: -22.744639999999954,longitude: -28.413790000000013},
	{latitude:-22.810759999999956,longitude:-28.320490000000014},
	true,
	realRoute.slice(3,6)
);
