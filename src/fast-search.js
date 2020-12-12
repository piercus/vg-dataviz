const fastSearch = function (value, list, min = 0, max) {
	if (list.length === 0) {
		throw (new Error('cannot fast search on empy list'));
	}

	if (typeof (max) === 'undefined') {
		max = list.length;
	}

	if (list[min] === value) {
		return [min];
	}

	if (min + 1 === max) {
		return [min, max];
	}

	if (list[max - 1] < value) {
		return [max - 1, null];
	}

	if (list[min] > value) {
		return [null, min];
	}

	const current = Math.floor((min + max) / 2);
	let localRes;
	if (list[current] <= value) {
		return fastSearch(value, list, current, max);
	}

	return fastSearch(value, list, min, current);
};

module.exports = fastSearch;
