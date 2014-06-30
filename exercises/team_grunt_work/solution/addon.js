var addon = require('./build/Release/addon'),
    fs = require('fs');

var corpus = fs.readFileSync('./corpus.txt', 'utf8').replace(/[^A-Za-z0-9_ ]/g, '').toLowerCase().match(/[^ ]+/g);

var syncres;

function runSync () {
  var start = Date.now();
  // Estimate() will execute in the current thread,
  // the next line won't return until it is finished
	var result = addon.countSync(corpus);
  console.log('Sync');
//  console.log(result);
  console.log('took ' + (Date.now() - start) + ' ms');
  syncres = result;
}

function runAsync () {
  // how many batches should we split the work in to?
	var batches = 2;
	var total = {};
	var start = Date.now();
	var ended = 0;

	function done (err, result) {
                for (var property in result) {
			if (result.hasOwnProperty(property)) {
				total[property] ?
					total[property] += result[property] :
					total[property] = result[property];
			}
		}

                if (++ended == batches) {
			console.log('Async');
	//		console.log(total);
			console.log('took ' + (Date.now() - start) + ' ms');
			for (var property in total) {
				if (total.hasOwnProperty(property) && syncres[property] != total[property]) {
					console.log('error');
				}
			}
			for (var property in syncres) {
				if (syncres.hasOwnProperty(property) && syncres[property] != total[property]) {
					console.log('error');
				}
			}
		}
	}

	addon.countAsync(corpus, batches, done);
}

runSync();
runAsync();
