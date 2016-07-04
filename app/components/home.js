import React from 'react';
import WaveSurfer from 'wavesurfer.js';

var Home = React.createClass({
	componentDidMount() {
		var wavesurfer = WaveSurfer.create({
		    container: '#waveform',
		    waveColor: 'violet',
		    progressColor: 'purple'
		});
		wavesurfer.load('https://p.scdn.co/mp3-preview/5d41e1ad319199325423a3a0c30186fddd023a23');
		wavesurfer.on('ready', function () {
    		// wavesurfer.play();
		});
	},
	handlePlay() {
		wavesurfer.play();
	},
	handlePause() {
		wavesurfer.pause();
	},
	handleStop() {
		wavesurfer.stop();
	},
	render() {
		return (
			<div>
				<div id="waveform"></div>
				<button onClick={this.handleStop}>Cue</button>
				<button onClick={this.handlePause}>Pause</button>
				<button onClick={this.handlePlay}>Play</button>
			</div>
		)
	}
});

module.exports = Home;
