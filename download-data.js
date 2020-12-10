const request = require('./request/request.js')
const parseData = require('./src/parse-data')

Promise.all([
	request('https://tracking2020.vendeeglobe.org/data/race/tracker_config.hwx?v=20201118074443', 'xml'),
	request('https://tracking2020.vendeeglobe.org/data/race/tracker_reports.hwx?v=20201119135938'),
	request('https://tracking2020.vendeeglobe.org/data/race/tracker_tracks.hwx?v=20201119135938'),
	request('https://tracking2020.vendeeglobe.org/data/shapes/shapes.hwx?v=1604855569'),
	request('https://tracking2020.vendeeglobe.org/data/race/tracker_live.hwx?v=1605799808429')
]).then(([
	trackerConfig,
	trackerReports,
	trackerTracks,
	shapes,
	trackerLive
]) => {
	const res = parseData({
		shapes,
		trackerConfig,
		trackerLive,
		trackerReports,
		trackerTracks
	});
	fs.writeFileSync(`dist/data.json`, JSON.stringify(res));
}).catch(err => console.log(err))
