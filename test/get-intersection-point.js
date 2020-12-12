const test = require('ava');

const getIntersectionPoint = require('../src/get-intersection-point');

test('simple intersection', t => {
	const res = getIntersectionPoint({
		latitude: 46.44535,
		longitude: -1.78072
	}, {
		latitude: 46.42661,
		longitude: -1.73589
	}, {
		latitude: 44.63857,
		longitude: -7.88044
	});
	// Console.log(res)
	t.true(res.ratio < 0.01);
});

test('simple intersection  2', t => {
	const res = getIntersectionPoint({
		latitude: -2,
		longitude: 2
	}, {
		latitude: -1,
		longitude: 0
	}, {
		latitude: 0,
		longitude: 0
	});
	console.log(res);

	t.true(res.ratio < 0);
});
