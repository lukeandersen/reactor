import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            duration: 0,
            tempo: 0
        };

        this.wavesurfer = Object.create(WaveSurfer);

        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
    }

	componentDidMount() {
        let options = {
            container: this.refs.wavesurfer,
            waveColor: 'purple',
            cursorColor: 'red'
        }
        this.wavesurfer.init(options);

        this.wavesurfer.on('ready', () => {
            this.setState({
                duration: this.wavesurfer.getDuration().toFixed(2)
            });
        });
	}

    componentWillReceiveProps(nextProps) {
        if (this.props.track.preview_url !== nextProps.track.preview_url) {
            this.wavesurfer.load(nextProps.track.preview_url);
        }
    }

	handleTogglePlay() {
        this.wavesurfer.playPause();
	}
    handleStop() {
        this.wavesurfer.stop();
	}
    handleTempoChange() {
        this.setState({
            tempo: this.refs.tempo.value
        });
        this.wavesurfer.setPlaybackRate(this.refs.tempo.value);
	}
    // handleHotCue() {
    //     let cues = [];
    //     // TODO: get current payback pos
    //     // this.setState({
    //     //     playing: true,
    //     //     pos: cues[0]
    //     // });
    //     console.log('hot cue');
	// }
    // handleLoopIn() {
    //     let loop = [];
    //     // TODO: store loop in and out
    //     // TODO: make playback loop in <-> out range
    //     // TODO: Exit loop
    //     console.log('loop');
	// }
    render() {
        const albumImg = {
            background: `url(${this.props.track.album})`
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
                                <td className="pitch-val muted">{this.state.tempo}</td>
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
