import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            pos: 0,
            duration: 0,
            volume: 0.5
        };

        this.wavesurfer = Object.create(WaveSurfer);
    }

	componentDidMount() {
        let options = {
            container: this.refs.wavesurfer,
            waveColor: 'purple',
            cursorColor: 'red'
        }
        this.wavesurfer.init(options);
	}

    componentWillReceiveProps(nextProps) {
        if (this.props.track.preview_url !== nextProps.track.preview_url) {
            this.wavesurfer.load(nextProps.track.preview_url);
        }
    }

	// handleTogglePlay() {
    //     let playState = (this.state.playing === false) ? true : false;
    //     this.setState({
    //         playing: playState
    //     });
	// },
	// handleStop() {
    //     this.setState({
    //         playing: false,
    //         pos: 0
    //     });
	// },
    // handleTempoChange() {
    //     console.log('tempo changed', this.refs.tempo.value);
	// },
    // handleHotCue() {
    //     let cues = [];
    //     // TODO: get current payback pos
    //     // this.setState({
    //     //     playing: true,
    //     //     pos: cues[0]
    //     // });
    //     console.log('hot cue');
	// },
    // handleLoopIn() {
    //     let loop = [];
    //     // TODO: store loop in and out
    //     // TODO: make playback loop in <-> out range
    //     // TODO: Exit loop
    //     console.log('loop');
	// },
    // handleReady(e) {
    //     this.setState({
    //         duration: e.wavesurfer.getDuration().toFixed(2)
    //     });
    // },
    // handlePosChange(e) {
    //     let timeRemaining = function() {
    //         return (e.wavesurfer.getDuration() - e.wavesurfer.getCurrentTime()).toFixed(2);
    //     }
    //     this.setState({
    //         pos: e.originalArgs[0],
    //         duration: timeRemaining()
    //     });
    // },
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
                        <table className="player-table">
                            <tr>
                                <td width="100%" className="title">{this.props.track.name}</td>
                                <td width="90" className="time">-00.{this.state.duration}</td>
                            </tr>
                            <tr>
                                <td className="artist muted">{this.props.track.artist}</td>
                                <td className="pitch-val muted">0</td>
                            </tr>
                        </table>
                    </div>
                    <div className="deck">{this.props.name}</div>
                </div>
                <div className="body">
                    <div ref="wavesurfer" className="screen"></div>
                    <div className="tempo">
                        <input type="range" ref="tempo" onChange={this.handleTempoChange} min="0" max="2" step="0.01" className="pitch slider slider-vertical" />
                    </div>
                </div>
                <div className="footer">
                    <div>
                        <button className="play btn btn-lg" onClick={this.handleTogglePlay}>Play</button>
                        <button className="stop btn btn-lg" onClick={this.handleStop}>Stop</button>
                    </div>

                    <div className="hot-cue">
                        <button className="btn" onClick={this.handleHotCue}>1</button>
                        <button className="btn">2</button>
                        <button className="btn">3</button>
                        <button className="btn">4</button>
                    </div>

                    <div className="loop">
                        <div className="btn-group">
                            <button className="loop-in btn" onClick={this.handleLoopIn}>In</button>
                            <button className="loop-out btn" onClick={this.handleLoopOut}>Out</button>
                            <button className="loop-exit btn" onClick={this.handleLoopExit}>Exit</button>
                        </div>
                    </div>
                </div>
            </div>
    	);
    }
}

export default Player;
