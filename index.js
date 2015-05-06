var fs = require('fs');
var setterGetterify = require('setter-getterify');
var SamplePlayer = require('openmusic-sample-player');
var Promise = require('es6-promise').Promise;

module.exports = function(context) {

	var node = context.createGain();
	var nodeProperties = {
		steps: 16,
		resolution: 16, // although it's actually the inverse 1/16
		bpm: 125
	};

	setterGetterify(node, nodeProperties);

	var patterns = [
		[
			[ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ],
			[ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ]
		]
	];
	var currentPatternIndex = 0;
	var eventsList = [];
	var currentEventIndex = 0;
	
	// TODO: load samples
	var samplePlayers = [];

	// Sigh that we need to do it this way but it's the best we can do with
	// browserify brfs transforms
	var bassDrum = fs.readFileSync(__dirname + '/samples/bassdrum.wav');
	var clap = fs.readFileSync(__dirname + '/samples/clap.wav');
	var samples = [
		bassDrum,
		clap
	];

	var events = [];
	
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
		
			var sampleLoaded = new Promise(function(resolve, reject) {
				context.decodeAudioData(arrayBuffer, function(buffer) {
					samplePlayer.buffer = buffer;
					resolve(buffer);
				}, function(err) {
					reject(err);
				});
			});

			samplesLoaded.push(sampleLoaded);
		});

		return Promise.all(samplesLoaded);
	};

	function buildEventsList() {

		var currentPattern = patterns[currentPatternIndex];
		var steps = nodeProperties.steps;
		var bpm = nodeProperties.bpm;
		// TODO take resolution into account
		var beatLength = bpm / 60.0;
		var stepLength = beatLength / 4.0;
		var numTracks = samplePlayers.length;

		var eventTime = 0;

		eventsList = [];
		currentEventIndex = 0;

		for(var step = 0; step < steps; step++) {

			for(var track = 0; track < numTracks; track++) {
				var trigger = currentPattern[track][step];
				console.log(eventTime, trigger);
				if(trigger) {
					// TODO only adding 'trigger' events so far
					var ev = { track: track, time: eventTime };
					eventsList.push(ev);
				}
			}

			eventTime += stepLength;
		}
		
	}

	// This will start playing at when i.e. schedule things to start there, and loop when done
	node.start = function(when, offset, duration) {

		console.log('dRUM MACHINE', 'start', 'when', when, 'offset', offset, 'duration', duration);

		// TODO: Calculate events list
		buildEventsList();

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
		// TODO cancel scheduled events on the 'child' sample players
	};

	return node;

};
