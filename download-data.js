const request = require('./request/request.js')
const fs = require('fs');

const { getDistance } = require('geolib')
const getRouteProgress = require('./src/get-route-progress');
const boatIds = {};

request('https://tracking2020.vendeeglobe.org/data/race/tracker_config.hwx?v=20201118074443', 'xml').then((o) => {
	o.config.boats[0].boatclass[0].boat.forEach(o => {
		boatIds[o['$'].id] = o['$'].name
	})
	const route = o.config.leg[0].route[0]
		.split(';')
		.map(a =>
			a.split(',').map(e=> {
				return parseFloat(e)
			})
		).map(([lat, long]) => ({latitude: lat, longitude: long}))

	return Promise.all([
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_reports.hwx?v=20201119135938'),
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_tracks.hwx?v=20201119135938'),
		request('https://tracking2020.vendeeglobe.org/data/shapes/shapes.hwx?v=1604855569'),
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_live.hwx?v=1605799808429')
	]).then(([{reports}, trck, o2, live]) => {
		const {tracks} = trck
		console.log(Object.keys(o2), o2.shape.length)
		console.log(Object.keys(trck))

		const columns = [
			'id',
			'date',
			'offset',
			'name'
		].concat(reports.columns)
		const boatIndex = reports.columns.indexOf('boat');
		const resultReports = [columns];
		reports.history.forEach((h, hid) => {
			resultReports.push(...h.lines.map((a, id) => {
				if(a.length === reports.columns.length - 1){
					// hard-coded fix
					const ind = reports.columns.indexOf('track')
					a = a.slice(0, ind).concat([0]).concat(a.slice(ind))
				}
				if(a.length !== reports.columns.length){
					console.log(a, a.length, reports.columns.length,id, hid, reports.history.length)
					throw(new Error('Length is not correct'))
				}
				return Object.fromEntries([h.id, h.date, h.offset, boatIds[a[boatIndex]]].concat(a).map((v,i) => [columns[i], v]))
			}))
		})

		const getLastReport = function({id, timestamp}){
			const allReports = resultReports.filter(({date, boat}) => {
				return parseInt(boat) === id && new Date(date) < new Date(timestamp*1000)
			})
			return allReports[allReports.length - 1];
		}

		const posColumns = [
			'id',
			'name',
			'latitude',
			'longitude',
			'timestamp',
			'distance',
			'timeSecs',
			'knots',
			'vmg'
		]
		const resPositions = [posColumns];
		tracks.forEach(track => {
			const currentPosition = [];
			const {id, loc} = track;
			const name = boatIds[id];
			let currentRouteIndex = 0;
			const routeRange = 5;
			if(typeof(name) === 'string'){
				const positions0 = Object.fromEntries([
					id,
					name,
					loc[0][1]/100000,
					loc[0][2]/100000,
					loc[0][0],
					0,
					0,
					0,
					0
				].map((v,i) => [posColumns[i], v]));

				const progress0 = getRouteProgress({
					point: {latitude: loc[0][1]/100000, longitude: loc[0][2]/100000},
					route: route,
					currentRouteIndex,
					routeRange
				});
				currentRouteIndex = progress0.routeIndex;
				const positions = [Object.assign({}, positions0, progress0)];

				loc.slice(1).forEach((item, i) => {
					const latitude = (item[1]/100000+positions[i].latitude);
					const longitude = (item[2]/100000+positions[i].longitude);
					const timestamp = item[0]+positions[i].timestamp;

					const lastReport = getLastReport({
						id,
						timestamp
					})
					if(Number.isNaN(latitude)){
						console.log(positions[i], item)
						throw(new Error('nan latitude'))
					}

					const distance = getDistance(
						{latitude, longitude},
						positions[i]
					);

					const resRoute = getRouteProgress({
						point: {latitude, longitude},
						currentRouteIndex,
						routeRange,
						route
					});
					currentRouteIndex = resRoute.routeIndex;

					const timeSecs = item[0];

					let knots = distance/timeSecs*1.94384;
					const vmg = (resRoute.routeDistance-positions[i].routeDistance)/timeSecs*1.94384;

					const res1 = Object.fromEntries([
						id,
						name,
						latitude,
						longitude,
						timestamp,
						distance,
						timeSecs,
						knots,
						vmg
					].map((v,i) => [posColumns[i], v]));
					if(knots>500 || vmg > 500 || knots*3 < Math.abs(vmg)){
						console.log(new Date(lastReport.date), new Date(res1.timestamp*1000))
						console.log(JSON.stringify({
							point: {latitude, longitude},
							currentRouteIndex,
							routeRange,
							route
						}))
						console.log('routeIndex',
							positions[i],
							resRoute,
							res1,
							i
						);
						console.log({vmg, knots}, positions[i].routeDistance/1000, resRoute.routeDistance/1000, timeSecs)
						throw(new Error('invalid knots'))
					}
					positions.push(Object.assign({}, res1, resRoute));
				});
				resPositions.push(...positions)
			}
		})
		return {positions: resPositions, reports : resultReports, route}
	}).then(o => {
		fs.writeFileSync(`dist/data.json`, JSON.stringify(o));
	})
})
