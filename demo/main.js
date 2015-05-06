require('openmusic-oscilloscope').register('openmusic-oscilloscope');

var ac = new AudioContext();
var limiter = ac.createDynamicsCompressor();
limiter.connect(ac.destination);

var analyser = ac.createAnalyser();
analyser.connect(limiter);

var oscilloscope = document.querySelector('openmusic-oscilloscope');
oscilloscope.attachTo(analyser);

// Change below depending on what your audio node needs to do:
var DrumMachine = require('../');
var node = DrumMachine(ac);
node.connect(analyser);

node.ready().then(function() {
	console.log('ok we can go');
	node.start();
});
