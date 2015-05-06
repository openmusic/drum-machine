# openmusic-drum-machine

> A Web Audio drum machine

## Installing and building

<!--
### With NPM

[![Install with NPM](https://nodei.co/npm/openmusic-drum-machine.png?downloads=true&stars=true)](https://nodei.co/npm/openmusic-drum-machine/)

### From repository:

```bash
git clone https://github.com/openmusic/drum-machine.git
```

Then install build dependencies, etc with:
-->

Clone the repository, and then copy the files to your own folder and initialise your own git repository.

Install build dependencies, etc with:

```bash
npm install
```

To build a bundle for the demo:

```bash
npm run build
```

Demo files will be placed in `build/`. Open `build/index.html` to access the demo.

Remember to rebuild the bundle each time you make a change to the demo or node code. Alternatively you can also run the `watch` task, so it will watch for file changes and then rebuild the bundle for you:

```bash
npm run watch
```

## Usage

Create an instance of the node by passing it an audio context:

```javascript
var audioContext = new AudioContext();
var DrumMachine = require('openmusic-drum-machine');
var drumMachine = DrumMachine(audioContext);
```

The instance can be connected like any other Web Audio node:

```javascript
var gainNode = audioContext.createGain();
drumMachine.connect(gainNode);
```

Make sure to run `ready()` before you try to start it, otherwise the samples won't be ready to play and you won't be able to listen to anything:

```javascript
drumMachine.ready().then(function(resolve) {
	drumMachine.start();
});
```
