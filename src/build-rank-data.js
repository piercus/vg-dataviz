const uniq = require('./uniq');

module.exports = function(positions){
	const timestamps = uniq(positions, 'timestamp').filter(n => typeof(n) === 'number').sort((a,b) => a - b);

	const richTimestamps = timestamps.map(timestamp => {
		const filtered = positions.filter(r => {
			return r.timestamp === timestamp
		});
		const sorted = filtered.sort((a,b) => b.routeDistance - a.routeDistance);
		return {
			timestamp,
			rankingIds: sorted.map(({id}) => id),
			distanceMadeByRank: sorted.map(({routeDistance}) => routeDistance),
		}
	});

	const currentlyRanked = {};

	richTimestamps.forEach(t => {

		t.rankingIds.forEach((id, index) => {
			currentlyRanked[id] = {
				distance: t.distanceMadeByRank[index],
				timestamp: t.timestamp
			};
		});
		Object.keys(currentlyRanked).forEach(a => {
			if(a.timestamp !== t.timestamp){
				currentlyRanked[a] = {
					distance: currentlyRanked[a].distance,
					timestamp: t.timestamp
				};
			}
		})
		const globalRankingIds = Object.keys(currentlyRanked).map(a => parseInt(a, 10)).sort((a,b) => currentlyRanked[b].distance - currentlyRanked[a].distance)

		t.globalRankingIds = globalRankingIds;
		t.globalDistanceMadeByRank = globalRankingIds.map(a => currentlyRanked[a].distance)
	})

	return positions.map((p, positionId) => {
		const rTimestamp = richTimestamps.find(t => t.timestamp === p.timestamp);
		const index = rTimestamp.globalRankingIds.indexOf(p.id);
		p.rank = index + 1;

		if(p.rank === 0){
			console.log(p, positionId, rTimestamp)
			throw(new Error('rank should be >= 1'))
		}
		p.distToFirst = rTimestamp.globalDistanceMadeByRank[0] - p.routeDistance;
		if(p.distToFirst === null || Number.isNaN(p.distToFirst)){
			console.log(rTimestamp.globalDistanceMadeByRank[0], p)
			throw(new Error('dist to first should not be null'))
		}
		return p;
	})
}
