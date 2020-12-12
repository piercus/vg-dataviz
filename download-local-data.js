const fs = require('fs');
const parse = require('./request/parse');
const parseData = require('./src/parse-data');

Promise.all([
	parse(fs.readFileSync('test/data/tracker_config.hwx'), 'xml'),
	parse(fs.readFileSync('test/data/tracker_reports.hwx')),
	parse(fs.readFileSync('test/data/tracker_tracks.hwx')),
	parse(fs.readFileSync('test/data/shapes.hwx')),
	parse(fs.readFileSync('test/data/tracker_live.hwx'))
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
	fs.writeFileSync('dist/data.json', JSON.stringify(res));
}).catch(error => console.log(error));
