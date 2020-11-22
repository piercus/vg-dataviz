module.exports = function(rows, fn) {
	if(typeof(fn) === 'string'){
		const key = fn;
		fn = function(row) { return row[key]; }
	}
	return rows.map(fn);
}

  

