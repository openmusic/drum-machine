module.exports = function(audioContext, player) {
	
	var scheduleAheadTime = 0.1;
	var scheduleInterval = 0.025;
	var scheduleStart;
	var scheduleTimer;

	function getNow() {
		return audioContext.currentTime;
	}

	function schedule() {
		var now = getNow();
		player.scheduleEvents(now, scheduleAheadTime);
	}

	this.start = function(when) {
		scheduleStart = when; // getNow();
		player.start(scheduleStart);

		// setInterval works in ms
		scheduleTimer = setInterval(schedule, scheduleInterval * 1000);
		schedule();
	};

	this.stop = function() {
		clearInterval(scheduleTimer);
	};

};
