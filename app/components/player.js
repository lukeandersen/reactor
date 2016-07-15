import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';
import Classnames from 'classnames';

const clientId = '9dd85b3d536b3da895a951ddac00d6f8';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            playing: false,
            duration: '00:00',
            tempo: 0,
            cues: [],
            loopActive: false,
            loopIn: 0,
            loopOut: 0
        };

        this.wavesurfer = Object.create(WaveSurfer);

        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleHotCue = this.handleHotCue.bind(this);
        this.handleLoopIn = this.handleLoopIn.bind(this);
        this.handleLoopOut = this.handleLoopOut.bind(this);
        this.handleLoopExit = this.handleLoopExit.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
    }

	componentDidMount() {
        let options = {
            container: this.refs.wavesurfer,
            waveColor: 'purple',
            cursorColor: 'red'
        }

        this.wavesurfer.init(options);

        this.wavesurfer.on('loading', (amount) => {
            this.setState({
                loading: amount < 100 ? true : false
            });
        });

        this.wavesurfer.on('ready', () => {
            this.setState({
                duration: this.formatTime(this.wavesurfer.getDuration())
            });
        });

        this.wavesurfer.on('audioprocess', () => {
            this.setState({
                duration: this.formatTime(this.wavesurfer.getDuration() - this.wavesurfer.getCurrentTime())
            });

            if(this.state.loopActive && this.state.loopOut && this.wavesurfer.getCurrentTime().toFixed(2) === this.state.loopOut) {
                this.playLoop();
	        }
        });

        this.wavesurfer.on('finish', () => {
            this.setState({
                playing: false,
                loopActive: false
            });
        });
	}

    formatTime(t) {
        let hours = Math.floor(t / 3600);
        let minutes = Math.floor((t - (hours * 3600)) / 60);
        let seconds = (t - (hours * 3600) - (minutes * 60)).toFixed(0);

        // if (hours < 10) { hours = '0' + hours; }
        if (minutes < 10) { minutes = '0' + minutes; }
        if (seconds < 10) { seconds = '0' + seconds; }
        return minutes + ':' + seconds;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.track.preview_url !== nextProps.track.preview_url) {
            this.wavesurfer.load(`${nextProps.track.preview_url}?client_id=${clientId}`);
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
        console.log('this.wavesurfer.backend', this.wavesurfer.backend);
	}

    handleStop() {
        this.setState({
            playing: false,
            loopActive: false,
            duration: this.formatTime(this.wavesurfer.getDuration())
        });
        this.wavesurfer.stop();
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

    handleLoopIn() {
        this.setState({
            loopIn: this.wavesurfer.getCurrentTime()
        });
	}

    handleLoopOut() {
        if(this.state.loopIn) {
            this.setState({
                loopOut: this.wavesurfer.getCurrentTime().toFixed(2),
                loopActive: true
            });
        }
        if(this.wavesurfer.isPlaying()) {
            this.wavesurfer.stop();
	    }
        this.playLoop();
	}

    handleLoopExit() {
        if(this.state.loopActive === true) {
            this.setState({
                loopActive: false
            });
        } else {
            this.setState({
                loopActive: true
            });
            this.wavesurfer.stop();
            this.playLoop();
        }
	}

    handleTempoChange() {
        this.setState({
            tempo: this.refs.tempo.value
        });
        this.wavesurfer.setPlaybackRate(this.refs.tempo.value);
	}

    handleVolumeChange() {
        // this.setState({
        //     volume: this.refs.volume.value
        // });
        this.wavesurfer.setVolume(this.refs.volume.value);
	}

    playLoop() {
        this.setState({
            loopActive: true
        });
        this.wavesurfer.play(this.state.loopIn);
    }

    render() {
        // Styles
        let albumImg = { background: `url(${this.props.track.album})` },
            loading = Classnames('screen', {loading: this.state.loading}),
            playBtn = Classnames('btn btn-lg', {active: this.state.playing}),
            cueBtn1 = Classnames('btn', {active: this.state.cues[0]}),
            cueBtn2 = Classnames('btn', {active: this.state.cues[1]}),
            cueBtn3 = Classnames('btn', {active: this.state.cues[2]}),
            cueBtn4 = Classnames('btn', {active: this.state.cues[3]}),
            loop = Classnames('btn', {active: this.state.loopActive});

        let {duration, tempo} = this.state,
            {track, name} = this.props;

        return (
            <div className="player-with-controls">
                <div className="player">
                    <div className="header">
                        <div className="album" style={albumImg}></div>
                        <div className="header-body">
                            <table className="player-table">
                                <tbody>
                                    <tr>
                                        <td width="100%">{track.name}</td>
                                        <td width="90" className="text-right">-{duration}</td>
                                    </tr>
                                    <tr>
                                        <td className="muted">{track.artist}</td>
                                        <td className="muted" className="text-right">{tempo}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="deck">{name}</div>
                    </div>
                    <div className="body">
                        <div ref="wavesurfer" className={loading}></div>
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
                                <button className={loop} onClick={this.handleLoopIn}>In</button>
                                <button className={loop} onClick={this.handleLoopOut}>Out</button>
                                <button className="btn" onClick={this.handleLoopExit}>Exit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mixer">
                    <input ref="volume" onChange={this.handleVolumeChange} className="slider slider-vertical" type="range" min="0" max="1" step="0.01"/>
                </div>
            </div>
    	);
    }
}

export default Player;
