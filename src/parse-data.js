
const {getDistance, getRhumbLineBearing} = require('geolib');
const getRouteProgress = require('../src/get-route-progress');
const buildRankData = require('./build-rank-data');
module.exports = function ({
	trackerConfig,
	trackerLive,
	trackerReports,
	trackerTracks
}) {
	const boats = {};

	trackerConfig.config.boats[0].boatclass[0].boat.forEach(o => {
		boats[o.$.id] = {
			name: o.$.name,
			color: '#' + o.$.trackcolor
		};
	});
	const route = trackerConfig.config.leg[0].route[0]
		.split(';')
		.map(a =>
			a.split(',').map(e => {
				return Number.parseFloat(e);
			})
		).map(([lat, long]) => ({latitude: lat, longitude: long}));

	const routeBase = route.map(r => Object.assign({}, r));

	const {reports} = trackerReports;
	const tracks = trackerTracks.tracks;
	const live = trackerLive;

	const columns = [
		'id',
		'date',
		'offset',
		'name',
		'color'
	].concat(reports.columns);
	const boatIndex = reports.columns.indexOf('boat');
	const resultReports = [columns];
	reports.history.forEach((h, hid) => {
		resultReports.push(...h.lines.map((a, id) => {
			if (a.length === reports.columns.length - 1) {
				// Hard-coded fix
				const ind = reports.columns.indexOf('track');
				a = a.slice(0, ind).concat([0]).concat(a.slice(ind));
			}

			if (a.length !== reports.columns.length) {
				console.log(a, a.length, reports.columns.length, id, hid, reports.history.length);
				throw (new Error('Length is not correct'));
			}

			return Object.fromEntries([h.id, h.date, h.offset, boats[a[boatIndex]].name, boats[a[boatIndex]].color].concat(a).map((v, i) => [columns[i], v]));
		}));
	});

	const getLastReport = function ({id, timestamp}) {
		const allReports = resultReports.filter(({date, boat}) => {
			return Number.parseInt(boat) === id && new Date(date) < new Date(timestamp * 1000);
		});
		return allReports[allReports.length - 1];
	};

	const posColumns = [
		'id',
		'name',
		'color',
		'latitude',
		'longitude',
		'timestamp',
		'distance',
		'timeSecs',
		'knots',
		'vmg',
		'angle',
		'routeAngle'
	];
	const resPositions = [];
	tracks.forEach((track, trackId) => {
		const currentPosition = [];
		const {id, loc} = track;
		const name = boats[id] && boats[id].name;
		let currentRouteIndex = 0;
		const routeRange = 3;
		if (typeof (name) === 'string') {
			const color = boats[id].color;
			const positions0 = Object.fromEntries([
				id,
				name,
				color,
				loc[0][1] / 100000,
				loc[0][2] / 100000,
				loc[0][0],
				0,
				0,
				0,
				0,
				0,
				0
			].map((v, i) => [posColumns[i], v]));

			route.forEach((_, i) => {
				if (Math.abs(route[i].latitude - routeBase[i].latitude) > 1e-6) {
					throw (new Error('strange route'));
				}
			});

			const progress0 = getRouteProgress({
				point: {latitude: loc[0][1] / 100000, longitude: loc[0][2] / 100000},
				route,
				currentRouteIndex,
				routeRange
			});
			currentRouteIndex = progress0.routeIndex;
			const positions = [Object.assign({}, positions0, progress0)];

			loc.slice(1).forEach((item, i) => {
				const latitude = (item[1] / 100000 + positions[i].latitude);
				const longitude = (item[2] / 100000 + positions[i].longitude);
				const timestamp = item[0] + positions[i].timestamp;

				const lastReport = getLastReport({
					id,
					timestamp
				});
				if (Number.isNaN(latitude)) {
					console.log(positions[i], item);
					throw (new Error('nan latitude'));
				}

				const distance = getDistance(
					{latitude, longitude},
					positions[i]
				);
				const angle = getRhumbLineBearing(
					positions[i],
					{latitude, longitude}
				);
				const getRouteProgressOptions = {
					point: {latitude, longitude},
					currentRouteIndex,
					routeRange,
					route
				};
				const resRoute = getRouteProgress(getRouteProgressOptions);
				currentRouteIndex = resRoute.routeIndex;
				const routeAngle = resRoute.angle;

				const timeSecs = item[0];

				const knots = distance / timeSecs * 1.94384;
				const angleDiff = Math.abs(angle - routeAngle);
				const vmg = knots * Math.cos(angleDiff / 180 * Math.PI);
				const distanceDiff = Math.abs(positions[i].routeDistance - resRoute.routeDistance);
				const speedMade = Math.abs(distanceDiff / timeSecs * 1.94384);

				const res1 = Object.fromEntries([
					id,
					name,
					color,
					latitude,
					longitude,
					timestamp,
					distance,
					timeSecs,
					knots,
					vmg,
					angle,
					routeAngle
				].map((v, i) => [posColumns[i], v]));
				if (speedMade > 500) {
					console.log(resRoute);
					console.log(JSON.stringify(getRouteProgressOptions));
					console.log(positions[i]);

					// Console.log(new Date(lastReport.date), new Date(res1.timestamp*1000))
					// console.log(JSON.stringify({
					// 	point: {latitude, longitude},
					// 	currentRouteIndex,
					// 	routeRange,
					// 	route
					// }))
					// console.log('routeIndex',
					// 	positions[i],
					// 	resRoute,
					// 	res1,
					// 	i
					// );
					// console.log({vmg, knots}, positions[i].routeDistance/1000, resRoute.routeDistance/1000, timeSecs)
					throw (new Error('invalid knots'));
				}

				positions.push(Object.assign({}, res1, resRoute));
			});

			resPositions.push(...positions);
		}
	});
	return {positions: buildRankData(resPositions), reports: resultReports, route, boats};
};
