import React, {PropTypes} from 'react';
import Wavesurfer from 'react-wavesurfer';

var Player = React.createClass({
    getInitialState() {
        return {
            playing: false,
            pos: 0
        };
    },
	componentDidMount() {
		// var wavesurfer = WaveSurfer.create({
		//     container: '#screen',
		//     waveColor: 'purple',
		//     cursorColor: 'red'
		// });
        // setTimeout(() => {
        //     wavesurfer.load(this.props.track.preview_url);
        // }, 1000);
	},
	handleTogglePlay() {
        let playState = (this.state.playing === false) ? true : false;
        this.setState({
            playing: playState
        });
	},
	handlePause() {
		wavesurfer.pause();
	},
	handleStop() {
		wavesurfer.stop();
	},
    render() {
        const albumImg = {
            background: `url(${this.props.track.album})`
        };
        const waveOptions = {
            waveColor: 'purple',
            cursorColor: 'red'
        };
        return (
            <div className="player">
                <div className="header">
                    <div className="album" style={albumImg}></div>
                    <div className="header-body">
                        <div className="clearfix">
                            <h3 className="title">{this.props.track.name}</h3>
                            <h3 className="time"></h3>
                        </div>
                        <div className="clearfix sub-title">
                            <p className="artist">{this.props.track.artist}</p>
                            <p className="pitch-val">0</p>
                        </div>
                    </div>
                    <div className="deck">{this.props.name}</div>
                </div>
                <div className="body">
                    <div className="screen">
                        <Wavesurfer audioFile={this.props.track.preview_url} playing={this.state.playing} options={waveOptions} />
                    </div>
                    <div className="tempo">
                        <input type="range" min="0" max="2" step="0.01" className="pitch slider slider-vertical" />
                    </div>
                </div>
                <div className="footer">
                    <div>
                        <button className="play btn btn-lg" onClick={this.handleTogglePlay}>Play</button>
                        <button className="stop btn btn-lg">Stop</button>
                    </div>

                    <div className="hot-cue">
                        <button className="btn">1</button>
                        <button className="btn">2</button>
                        <button className="btn">3</button>
                        <button className="btn">4</button>
                        <button className="btn">5</button>
                        <button className="btn">6</button>
                    </div>

                    <div className="loop">
                        <div className="btn-group">
                            <button className="loop-in btn">In</button>
                            <button className="loop-out btn">Out</button>
                            <button className="loop-exit btn">Exit</button>
                        </div>
                    </div>
                </div>
            </div>
    	);
    }
});

module.exports = Player;
