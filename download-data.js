const request = require('./request/request.js')
const fs = require('fs');

const { getDistance } = require('geolib')

const boatIds = {};

request('https://tracking2020.vendeeglobe.org/data/race/tracker_config.hwx?v=20201118074443', 'xml').then((o) => {
	o.config.boats[0].boatclass[0].boat.forEach(o => {
		boatIds[o['$'].id] = o['$'].name
	})
	return Promise.all([
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_reports.hwx?v=20201119135938'),
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_tracks.hwx?v=20201119135938'),
		request('https://tracking2020.vendeeglobe.org/data/shapes/shapes.hwx?v=1604855569'),
		request('https://tracking2020.vendeeglobe.org/data/race/tracker_live.hwx?v=1605799808429')
	]).then(([{reports}, {tracks}, o2, live]) => {
		
		
		
		const columns = [
			'id',
			'date',
			'offset',
			'name'
		].concat(reports.columns)
		const boatIndex = reports.columns.indexOf('boat');
		const result = [columns];
		reports.history.forEach((h, hid) => {
			result.push(...h.lines.map((a, id) => {
				if(a.length === reports.columns.length - 1){
					// hard-coded fix
					const ind = reports.columns.indexOf('track')
					a = a.slice(0, ind).concat([0]).concat(a.slice(ind))
				}
				if(a.length !== reports.columns.length){
					console.log(a, a.length, reports.columns.length,id, hid, reports.history.length)
					throw(new Error('Length is not correct'))
				}
				return [h.id, h.date, h.offset, boatIds[a[boatIndex]]].concat(a)
			}))
		})

		fs.writeFileSync(`dist/data.csv`, result.map(r => r.join(',')).join('\n'))
		
		const posColumns = [
			'id',
			'name',
			'latitude',
			'longitude',
			'timestamp',
			'distance',
			'timeSecs',
			'knots'
		]
		const resPositions = [posColumns];
		tracks.forEach(track => {
			const currentPosition = [];
			const {id, loc} = track;
			const name = boatIds[id];
			if(typeof(name) === 'string'){
				const positions = [[
					id,
					name,
					loc[0][1]/100000,
					loc[0][2]/100000, 
					loc[0][0],
					0,
					0,
					0
				]];
				loc.slice(1).forEach((item, i) => {
					const latitude = (item[1]/100000+positions[i][2]);
					const longitude = (item[2]/100000+positions[i][3]); 
					const timestamp = item[0]+positions[i][4];
					console.log(timestamp)
					if(Number.isNaN(latitude)){
						throw(new Error('nan latitude'))
					}

					const distance = getDistance(
						{latitude, longitude},
						{latitude: positions[i][2], longitude: positions[i][3]}
					);
					const timeSecs = item[0];

					let knots = distance/timeSecs*1.94384;
					if(knots>500){
						console.log(knots, distance, timeSecs, {latitude, longitude}, {latitude: positions[i][2], longitude: positions[i][3]}, item)
						throw(new Error('invalid knots'))
					} 
					positions.push([
						id,
						name,
						latitude,
						longitude,
						timestamp,
						distance,
						timeSecs,
						knots
					]);
				});
				resPositions.push(...positions)
			}
		})
		fs.writeFileSync(`dist/positions.csv`, resPositions.map(r => r.join(',')).join('\n'))
	})
})

