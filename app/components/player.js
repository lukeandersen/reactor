import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.min.js';
import Classnames from 'classnames';
import Axios from 'axios';

const clientId = '9dd85b3d536b3da895a951ddac00d6f8';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            playing: false,
            duration: '00:00',
            tempo: 0,
            tempoInput: 1,
            cues: [],
            loopActive: false,
            loopIn: false,
            loopOut: false,
            maxVol: 1,
            cueActive: false
        };

        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);

        this.handleHotCue = this.handleHotCue.bind(this);

        this.handleLoopIn = this.handleLoopIn.bind(this);
        this.handleLoopOut = this.handleLoopOut.bind(this);
        this.handleLoopExit = this.handleLoopExit.bind(this);

        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTempoBend = this.handleTempoBend.bind(this);
        this.handleTempoBendStop = this.handleTempoBendStop.bind(this);

        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.calculateGain = this.calculateGain.bind(this);

        this.cueTrack = this.cueTrack.bind(this);
    }

	componentDidMount() {
        let options = {
            audioContext: this.props.ac,
            container: this.refs.wavesurfer,
            waveColor: 'purple',
            progressColor: 'purple',
            cursorColor: 'red',
            hideScrollbar: true,
            showTime: true,
            plugins: [
                MinimapPlugin.create({
                    waveColor: '#555',
                    progressColor: '#333'
                })
            ]
        }

        this.wavesurfer = new WaveSurfer(options);
        this.wavesurfer.init();

        this.wavesurfer.on('loading', (amount) => {
            this.setState({ loading: amount < 100 ? true : false });
        });

        this.wavesurfer.on('ready', () => {
            this.setState({ duration: this.formatTime(this.wavesurfer.getDuration()) });
            this.wavesurfer.zoom(50);
        });

        this.wavesurfer.on('error', (error) => {
            console.log('error', error);
        });

        this.wavesurfer.on('audioprocess', () => {
            this.setState({ duration: this.formatTime(this.wavesurfer.getDuration() - this.wavesurfer.getCurrentTime()) });

            if(this.state.loopActive && this.state.loopOut && this.wavesurfer.getCurrentTime().toFixed(2) >= this.state.loopOut) {
                // TODO: Make get of current time more precice
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

    cueTrack() {
        // TODO: Force audio to be mono per channel and create master/booth gain control
        let active = this.state.cueActive ? false : true;
        this.setState({ cueActive: active });
        let panner = this.wavesurfer.backend.ac.createStereoPanner();
        if(active) {
            panner.pan.value = this.props.name === 'A' ? -1 : 1;
            this.wavesurfer.backend.setFilter(panner);
        } else {
            this.wavesurfer.backend.disconnectFilters(panner);
        }
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
            // Clear the current track
            this.wavesurfer.empty()

            // TODO: Check if Safari has fixed the 302 redirect, if so just load the track
            Axios.get(`${nextProps.track.preview_url}?client_id=${clientId}&_status_code_map[302]=200`).then((track) => {
                this.wavesurfer.load(track.config.url);
            }).catch((error) => {
                console.log('error', error);
            });

            this.setState({
                playing: false,
                cues: []
            });
        }

        if(this.props.xfade !== nextProps.xfade) {
            if(this.props.name === 'A' && nextProps.xfade > 0) {
                this.wavesurfer.setVolume(this.calculateGain(nextProps.xfade));
            }
            if(this.props.name === 'B' && nextProps.xfade < 0) {
                this.wavesurfer.setVolume(this.calculateGain(nextProps.xfade));
            }
        }
    }

	handleTogglePlay() {
        this.setState({ playing: this.state.playing === false ? true : false });
        this.wavesurfer.setVolume(this.refs.volume.value);
        this.wavesurfer.playPause();
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
        let current = this.wavesurfer.getCurrentTime()

        if(newCues[index]) {
            this.setState({ playing: true });
            this.wavesurfer.play(newCues[index]);
        } else {
            newCues[index] = current
            this.setState({ cues: newCues });
        }
	}

    handleLoopIn() {
        this.setState({ loopIn: this.wavesurfer.getCurrentTime() });
	}

    handleLoopOut() {
        if(this.state.loopIn && this.wavesurfer.isPlaying()) {
            this.setState({ loopOut: this.wavesurfer.getCurrentTime() });
            this.playLoop();
        }
	}

    handleLoopExit() {
        if(!this.state.loopActive && this.wavesurfer.isPlaying()) {
            this.setState({ loopActive: true });
            this.wavesurfer.stop();
            this.playLoop();
        } else {
            this.setState({ loopActive: false });
        }
	}

    playLoop() {
        this.setState({ loopActive: true });
        this.wavesurfer.play(this.state.loopIn);
    }

    handleTempoChange() {
        let formatTempo = function(val) {
            let value = Number(val)
            if (value === 1) {
                return '0'
            } else if (value < 1) {
                return '-' + ((1-value)*100).toFixed(1) + '%';
            } else {
                return '+' + Math.abs(((1-value)*100)).toFixed(1) + '%';
            }
        };
        this.setState({ tempo: formatTempo(this.refs.tempo.value), tempoInput: this.refs.tempo.value });
        this.wavesurfer.setPlaybackRate(this.refs.tempo.value);
	}

    handleTempoBend(e) {
        let max = 1.1,
            min = 0.9,
            currentTempo = this.refs.tempo.value;

        if(e == 'up') {
            this.bend = setInterval(() => {
                currentTempo = Number(currentTempo) + 0.01;
                this.wavesurfer.setPlaybackRate(currentTempo);
            }, 100);
        } else {
            this.bend = setInterval(() => {
                currentTempo = Number(currentTempo) - 0.01;
                this.wavesurfer.setPlaybackRate(currentTempo);
            }, 100);
        }
	}

    handleTempoBendStop() {
        clearInterval(this.bend);
        this.wavesurfer.setPlaybackRate(this.refs.tempo.value);
	}

    handleVolumeChange() {
        let newPlayerVol = Math.abs(this.refs.volume.value * this.state.maxVol);
        this.wavesurfer.setVolume(newPlayerVol);
	}

    calculateGain(faderVal) {
        /*  Get movement as a percentage (1 - 0.25 = 0.75 || 75%) &
            always make sure its a positive value, then
            return new volume value. 75% of 0.5 = 0.375 */

        let currentVol = this.refs.volume.value,
            move = 1 - Math.abs(faderVal),
            newVol = move * currentVol;

        this.setState({ maxVol: move });

        return newVol;
    }

    render() {
        // Styles
        let albumImg = { backgroundImage: this.props.track.album ? `url(${this.props.track.album})` : 'linear-gradient(to top, #555, #999)' },
            loading = Classnames('screen', {loading: this.state.loading}),
            playBtn = Classnames('btn btn-lg', {active: this.state.playing}),
            cueBtn1 = Classnames('btn', {active: this.state.cues[0]}),
            cueBtn2 = Classnames('btn', {active: this.state.cues[1]}),
            cueBtn3 = Classnames('btn', {active: this.state.cues[2]}),
            cueBtn4 = Classnames('btn', {active: this.state.cues[3]}),
            loop = Classnames('btn', {active: this.state.loopActive}),
            cueAudio = Classnames('cue', {active: this.state.cueActive});

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
                        <div id="wavesurfer" ref="wavesurfer" className={loading}></div>
                        <div className="tempo">
                            <input type="range" ref="tempo" onChange={this.handleTempoChange} min="0.9" max="1.1" step="0.001" className="slider slider-vertical" value={this.state.tempoInput} />
                            <div className="bend">
                                <button onMouseDown={() => this.handleTempoBend('up')} onMouseUp={this.handleTempoBendStop}>+</button>
                                <button onMouseDown={() => this.handleTempoBend('down')} onMouseUp={this.handleTempoBendStop}>-</button>
                            </div>
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
                    <button className={cueAudio} onClick={this.cueTrack}>Cue</button>
                    <input ref="volume" onChange={this.handleVolumeChange} className="slider slider-vertical" type="range" min="0" max="1" step="0.01"/>
                </div>
            </div>
    	);
    }
}

export default Player;
