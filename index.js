var fs = require('fs');
var setterGetterify = require('setter-getterify');
var SamplePlayer = require('openmusic-sample-player');
var Promise = require('es6-promise').Promise;

module.exports = function(context) {

	var node = context.createGain();
	var nodeProperties = {
		steps: 16,
		bpm: 125
	};

	setterGetterify(node, nodeProperties);

	var patterns = [
		{
			0: [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ]
		}
	];
	
	// TODO: load samples
	var samplePlayers = [];

	var bassDrum = fs.readFileSync(__dirname + '/samples/bassdrum.wav');
	var samples = [
		bassDrum
	];
	
	// Makes sure the machine is ready to play
	node.ready = function() {
		var samplesLoaded = [];
		
		// disconnect existing samplers just in case
		samplePlayers.forEach(function(s) {
			s.disconnect();
		});

		// dump them, and let's start again
		samplePlayers = [];
		
		samples.forEach(function(sample, index) {
			console.log('loading sample', index);
			var samplePlayer = new SamplePlayer(context);
			var arrayBuffer = sample.toArrayBuffer();
		
			samplePlayers.push(samplePlayer);
			samplePlayer.connect(node);
		
			/*var res = context.decodeAudioData(arrayBuffer, function(bufferSource) {
				console.log('decoded');
				samplePlayer.buffer = bufferSource;
			}, function(er) {
				console.error('error decoding buffer', er);
			});
			console.log(res);*/

			/*var sampleLoaded = context.decodeAudioData(arrayBuffer)
				.then(function(buffer) {
					//samplePlayer.buffer = buffer;
					console.log('decoded', buffer);
				}, function(err) {
					console.error('error', err);
				});*/

			var sampleLoaded = new Promise(function(resolve, reject) {
				context.decodeAudioData(arrayBuffer, function(buffer) {
					console.log('decoded');
					samplePlayer.buffer = buffer;
					resolve(buffer);
				}, function(err) {
					console.error('err', err);
					reject(err);
				});
			});

			samplesLoaded.push(sampleLoaded);
		});

		return Promise.all(samplesLoaded);
	};

	// This will start playing at when i.e. schedule things to start there, and loop when done
	node.start = function(when, offset, duration) {

		console.log('dRUM MACHINE', 'start', 'when', when, 'offset', offset, 'duration', duration);

		// TODO: Calculate events list

		when = when !== undefined ? when : 0;
		offset = offset !== undefined ? offset : 0;

		// TMP TMP TMP
		samplePlayers.forEach(function(sampler) {
			sampler.start();
		});
		
	};

	node.stop = function(when) {
	};

	node.cancelScheduledEvents = function(when) {
	};

	

	return node;

};
