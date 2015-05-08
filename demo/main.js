require('openmusic-oscilloscope').register('openmusic-oscilloscope');
require('openmusic-slider').register('openmusic-slider');

var ac = new AudioContext();
var limiter = ac.createDynamicsCompressor();
limiter.connect(ac.destination);

var analyser = ac.createAnalyser();
analyser.connect(limiter);

var DrumMachine = require('../');
var node = DrumMachine(ac);
node.connect(analyser);

node.ready().then(function() {
	console.log('ok we can go, the machine has ', node.tracks, 'tracks');
	node.start();
});

var oscilloscope = document.querySelector('openmusic-oscilloscope');
oscilloscope.attachTo(analyser);

var slider = document.querySelector('openmusic-slider');
slider.addEventListener('input', function(ev) {
	var value = Math.round(slider.value);
	node.bpm = value;
});
