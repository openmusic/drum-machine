var fs = require('fs');
var setterGetterify = require('setter-getterify');

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
	var samplePath = path.join(__dirname, 'samples');
	
	var bassDrum = fs.readFileSync(__dirname + '/samples/bassdrum.wav');
	
	var samples = [
		bassDrum
	];

	// TODO init openmusic sampleplayer?

	// This will start playing at when i.e. schedule things to start there, and loop when done
	node.start = function(when, offset, duration) {

		console.log('dRUM MACHINE', 'start', 'when', when, 'offset', offset, 'duration', duration);

		// TODO: Calculate events list

		when = when !== undefined ? when : 0;
		offset = offset !== undefined ? offset : 0;
		
	};

	node.stop = function(when) {
	};

	node.cancelScheduledEvents = function(when) {
	};

	return node;

};
