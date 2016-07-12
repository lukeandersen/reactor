import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';
import Classnames from 'classnames';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            duration: 0,
            tempo: 0,
            cues: []
        };

        this.wavesurfer = Object.create(WaveSurfer);

        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleHotCue = this.handleHotCue.bind(this);
    }

	componentDidMount() {
        let options = {
            container: this.refs.wavesurfer,
            waveColor: 'purple',
            cursorColor: 'red'
        }

        this.wavesurfer.init(options);
        this.wavesurfer.setVolume(0.1);

        this.wavesurfer.on('ready', () => {
            this.setState({
                duration: this.wavesurfer.getDuration().toFixed(2)
            });
        });

        this.wavesurfer.on('audioprocess', () => {
            this.setState({
                duration: (this.wavesurfer.getDuration() - this.wavesurfer.getCurrentTime()).toFixed(2)
            });
        });
	}

    componentWillReceiveProps(nextProps) {
        if (this.props.track.preview_url !== nextProps.track.preview_url) {
            this.wavesurfer.load(nextProps.track.preview_url);
            this.setState({
                playing: false,
                cues: []
            });
        }
    }

	handleTogglePlay() {
        this.setState({
            playing: this.state.playing === false ? true : false
        });
        this.wavesurfer.playPause();
	}

    handleStop() {
        this.setState({
            playing: false
        });
        this.wavesurfer.stop();
	}

    handleTempoChange() {
        this.setState({
            tempo: this.refs.tempo.value
        });
        this.wavesurfer.setPlaybackRate(this.refs.tempo.value);
	}

    handleHotCue(index) {
        let newCues = this.state.cues;

        if(newCues[index]) {
            this.setState({
                playing: true
            });
            this.wavesurfer.play(newCues[index]);
        } else {
            newCues[index] = this.wavesurfer.getCurrentTime();
            this.setState({
                cues: newCues
            });
        }
	}

    // handleLoopIn() {
    //     let loop = [];
    //     // TODO: store loop in and out
    //     // TODO: make playback loop in <-> out range
    //     // TODO: Exit loop
    //     console.log('loop');
	// }

    render() {
        let albumImg = { background: `url(${this.props.track.album})` },
            playBtn = Classnames('btn btn-lg', {active: this.state.playing}),
            cueBtn1 = Classnames('btn', {active: this.state.cues[0]}),
            cueBtn2 = Classnames('btn', {active: this.state.cues[1]}),
            cueBtn3 = Classnames('btn', {active: this.state.cues[2]}),
            cueBtn4 = Classnames('btn', {active: this.state.cues[3]});
        return (
            <div className="player">
                <div className="header">
                    <div className="album" style={albumImg}></div>
                    <div className="header-body">
                        <table className="player-table">
                            <tbody>
                                <tr>
                                    <td width="100%">{this.props.track.name}</td>
                                    <td width="90" className="text-right">-00.{this.state.duration}</td>
                                </tr>
                                <tr>
                                    <td className="muted">{this.props.track.artist}</td>
                                    <td className="muted" className="text-right">{this.state.tempo}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="deck">{this.props.name}</div>
                </div>
                <div className="body">
                    <div ref="wavesurfer" className="screen"></div>
                    <div className="tempo">
                        <input type="range" ref="tempo" onChange={this.handleTempoChange} min="0.8" max="1.2" step="0.01" className="slider slider-vertical" />
                    </div>
                </div>
                <div className="footer">
                    <div>
                        <button className={playBtn} onClick={this.handleTogglePlay}>Play</button>
                        <button className="btn btn-lg" onClick={this.handleStop}>Stop</button>
                    </div>

                    <div className="hot-cue">
                        <button className={cueBtn1} onClick={() => this.handleHotCue(0)}>1</button>
                        <button className={cueBtn2} onClick={() => this.handleHotCue(1)}>2</button>
                        <button className={cueBtn3} onClick={() => this.handleHotCue(2)}>3</button>
                        <button className={cueBtn4} onClick={() => this.handleHotCue(3)}>4</button>
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
