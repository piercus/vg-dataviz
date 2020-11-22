const test = require('ava');

const getRouteProgress = require('../src/get-route-progress')
const route = [{
	"latitude":46.42661,"longitude":-1.73589
},{
	"latitude":44.63857,"longitude":-7.88044
},{
	"latitude":36.73942,"longitude":-17.32819
},{
	"latitude":9.16335,"longitude":-28.48869
},{
	latitude: -30.16935, longitude: -22.33044
}]
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
	console.log({res1, res2})
	console.log({diff: diff/1000})
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
		"currentRouteIndex":3,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const res2 = getRouteProgress({"point":{"latitude":-11.321779999999958,"longitude":-31.099950000000014},"currentRouteIndex":3,"routeRange":2,"route":[
		{"latitude":46.42661,"longitude":-1.73589},
		{"latitude":44.63857,"longitude":-7.88044},
		{"latitude":36.73942,"longitude":-17.32819},
		{"latitude":9.16335,"longitude":-28.48869},
		{"latitude":-30.16935,"longitude":-22.33044},
		{"latitude":-38.69362,"longitude":15.6315}
	]})
	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	console.log({res1, res2})
	console.log({diff: diff/1000})
	t.true(diff/1000 < 200);
})


test('Route progress 3', t => {
	const pointBefore = { longitude: -28.421339325079288, latitude: 9.362707808278092 };
	const opts = {
		"currentRouteIndex":0,
		"routeRange":5,
		route
	};
	const res1 = getRouteProgress(Object.assign({point: pointBefore}, opts));
	// const res2 = getRouteProgress(Object.assign({point: pointAfter}, opts));
	const pointAfter = {"latitude":9.019340000000003,"longitude":-27.729469999999992};
	const res2 = getRouteProgress({"point":pointAfter,"currentRouteIndex":0,"routeRange":5,"route":[{"latitude":46.42661,"longitude":-1.73589},{"latitude":44.63857,"longitude":-7.88044},{"latitude":36.73942,"longitude":-17.32819},{"latitude":9.16335,"longitude":-28.48869},{"latitude":-30.16935,"longitude":-22.33044},{"latitude":-38.69362,"longitude":15.6315},{"latitude":-44.27657,"longitude":55.54419},{"latitude":-45.27746,"longitude":85.28994},{"latitude":-43.43518,"longitude":111.65364},{"latitude":-46.86975,"longitude":140.88656},{"latitude":-50.48668,"longitude":-168.97053},{"latitude":-49.83963,"longitude":-119.35556},{"latitude":-54.50021,"longitude":-90.43525},{"latitude":-56.1663,"longitude":-67.01964},{"latitude":-50.94474,"longitude":-61.56453},{"latitude":-37.31959,"longitude":-47.25903},{"latitude":-15.63266,"longitude":-34.14494},{"latitude":13.57691,"longitude":-29.66311},{"latitude":39.88757,"longitude":-16.8385},{"latitude":46.42661,"longitude":-1.73589}]})

	const diff = Math.abs(res1.routeDistance - res2.routeDistance);
	console.log({res1, res2})
	const vmg = diff/1800*1.94384
	console.log({vmg})
	t.true(vmg < 50);
});
//
