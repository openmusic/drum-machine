var fs = require('fs');
var setterGetterify = require('setter-getterify');
var SamplePlayer = require('openmusic-sample-player');
var Promise = require('es6-promise').Promise;

module.exports = function(context) {

	var node = context.createGain();
	var nodeProperties = {
		tracks: 0,
		steps: 16,
		resolution: 16, // although it's actually the inverse 1/16
		bpm: 125
	};

	setterGetterify(node, nodeProperties);

	var patterns = [
		[
			[ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ],
			[ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ],
			[ 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1 ]
		]
	];
	var currentPatternIndex = 0; // TODO not used yet
	var currentStep = 0;
	var stepTime;
	var startTime;
	
	var scheduleTimeout = null;

	var samplePlayers = [];

	// Sigh that we need to do it this way but it's the best we can do with
	// browserify brfs transforms
	var bassDrum = fs.readFileSync(__dirname + '/samples/bassdrum.wav');
	var clap = fs.readFileSync(__dirname + '/samples/clap.wav');
	var closedHat = fs.readFileSync(__dirname + '/samples/hihat_closed.wav');

	var samples = [
		bassDrum,
		clap,
		closedHat
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

		nodeProperties.tracks = samplePlayers.length;
		
		return Promise.all(samplesLoaded);
	};

	node.start = function() {
		stepTime = 0.0;
		startTime = context.currentTime + 0.005;
		samplePlayers.forEach(function(sampler) {
			sampler.stop();
		});
		schedule();
	};

	node.stop = function(when) {
		clearTimeout(scheduleTimeout);
	};

	node.cancelScheduledEvents = function(when) {
		// TODO cancel scheduled events on the 'child' sample players
	};

	function schedule() {
		
		var currentPattern = patterns[currentPatternIndex];
		var numTracks = samplePlayers.length;

		var currentTime = context.currentTime;

		currentTime -= startTime;

		// TODO also why 0.2
		while(stepTime < currentTime + 0.2) {

			var contextPlayTime = stepTime + startTime;

			for(var track = 0; track < numTracks; track++) {
				var sampler = samplePlayers[track];
				var trigger = currentPattern[track][currentStep];
				if(trigger) {
					sampler.start(contextPlayTime);
				}
			}

			var oldStep = currentStep;
			advanceStep();

			// Dispatch event for drawing if step != oldStep
			if(oldStep !== currentStep) {
				var ev = new CustomEvent('step', { detail: { value: currentStep } });
				node.dispatchEvent(ev);
			}
		}

		// TODO: Chris's example has the timeout at 0 but it seems excessive?
		scheduleTimeout = setTimeout(schedule, 10);

	}

	function advanceStep() {
		
		// Advance time by a 16th note...
	    var secondsPerBeat = 60.0 / nodeProperties.bpm;
		
		currentStep++;

		if(currentStep === nodeProperties.steps) {
			currentStep = 0;
		}

		// TODO something something swing which I'm ignoring
		// TODO also why 0.25 - maybe because it's a black note so 1/4 of bar?
		stepTime += 0.25 * secondsPerBeat;

	}

	return node;

};
