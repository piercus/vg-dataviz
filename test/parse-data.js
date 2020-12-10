const parseData = require('../src/parse-data')
const test = require('ava')
const fs = require('fs');
const parse = require('../request/parse')
test('parse data', t => {
	return Promise.all([
		parse(fs.readFileSync('test/data/shapes.hwx')),
		parse(fs.readFileSync('test/data/tracker_config.hwx'), 'xml'),
		parse(fs.readFileSync('test/data/tracker_live.hwx')),
		parse(fs.readFileSync('test/data/tracker_reports.hwx')),
		parse(fs.readFileSync('test/data/tracker_tracks.hwx'))
	]).then(([
		shapes,
		trackerConfig,
		trackerLive,
		trackerReports,
		trackerTracks
	]) => {
		const res = parseData({
			shapes,
			trackerConfig,
			trackerLive,
			trackerReports,
			trackerTracks
		});
		// console.log({res})
		t.is(res.positions.length, 38839);
		t.is(res.boats['1'].color, '#04ECFF');
	})

});
