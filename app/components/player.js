import React, {Component, PropTypes} from 'react';
import WaveSurfer from 'wavesurfer.js';
import Classnames from 'classnames';
import Axios from 'axios';

/* Minimap */
WaveSurfer.Minimap = WaveSurfer.util.extend({}, WaveSurfer.Drawer, WaveSurfer.Drawer.Canvas, {
    init: function (wavesurfer, params) {
        this.wavesurfer = wavesurfer;
        this.container = this.wavesurfer.drawer.container;
        this.lastPos = this.wavesurfer.drawer.lastPos;
        this.params = wavesurfer.util.extend(
            {}, this.wavesurfer.drawer.params, {
                showRegions: false,
                showOverview: false,
                overviewBorderColor: 'green',
                overviewBorderSize: 2
            }, params, {
                scrollParent: false,
                fillParent: true
            }
        );

        this.width = 0;
        this.height = this.params.height * this.params.pixelRatio;

        this.createWrapper();
        this.createElements();

        if (WaveSurfer.Regions && this.params.showRegions) {
            this.regions();
        }

        this.bindWaveSurferEvents();
        this.bindMinimapEvents();
    },
    regions: function() {
        var my = this;
        this.regions = {};

        this.wavesurfer.on('region-created', function(region) {
            my.regions[region.id] = region;
            my.renderRegions();
        });

        this.wavesurfer.on('region-updated', function(region) {
            my.regions[region.id] = region;
            my.renderRegions();
        });

        this.wavesurfer.on('region-removed', function(region) {
            delete my.regions[region.id];
            my.renderRegions();
        });
    },
    renderRegions: function() {
        var my = this;
        var regionElements = this.wrapper.querySelectorAll('region');
        for (var i = 0; i < regionElements.length; ++i) {
          this.wrapper.removeChild(regionElements[i]);
        }

        Object.keys(this.regions).forEach(function(id){
            var region = my.regions[id];
            var width = (my.width * ((region.end - region.start) / my.wavesurfer.getDuration()));
            var left = (my.width * (region.start / my.wavesurfer.getDuration()));
            var regionElement = my.style(document.createElement('region'), {
                height: 'inherit',
                backgroundColor: region.color,
                width: width + 'px',
                left: left + 'px',
                display: 'block',
                position: 'absolute'
            });
            regionElement.classList.add(id);
            my.wrapper.appendChild(regionElement);
        });
    },
    createElements: function() {
        WaveSurfer.Drawer.Canvas.createElements.call(this);

        if (this.params.showOverview) {
            this.overviewRegion =  this.style(document.createElement('overview'), {
                height: (this.wrapper.offsetHeight - (this.params.overviewBorderSize * 2)) + 'px',
                width: '0px',
                display: 'block',
                position: 'absolute',
                cursor: 'move',
                border: this.params.overviewBorderSize + 'px solid ' + this.params.overviewBorderColor,
                zIndex: 2,
                opacity: this.params.overviewOpacity
            });

            this.wrapper.appendChild(this.overviewRegion);
        }
    },

    bindWaveSurferEvents: function () {
        var my = this;
        this.wavesurfer.on('ready', this.render.bind(this));
        this.wavesurfer.on('audioprocess', function (currentTime) {
            my.progress(my.wavesurfer.backend.getPlayedPercents());
        });
        this.wavesurfer.on('seek', function(progress) {
            my.progress(my.wavesurfer.backend.getPlayedPercents());
        });

        if (this.params.showOverview) {
            this.wavesurfer.on('scroll', function(event) {
                if (!my.draggingOverview) {
                    my.moveOverviewRegion(event.target.scrollLeft / my.ratio);
                }
            });

            this.wavesurfer.drawer.wrapper.addEventListener('mouseover', function(event) {
                if (my.draggingOverview)  {
                    my.draggingOverview = false;
                }
            });
        }

        var prevWidth = 0;
        var onResize = function () {
            if (prevWidth != my.wrapper.clientWidth) {
                prevWidth = my.wrapper.clientWidth;
                my.render();
                my.progress(my.wavesurfer.backend.getPlayedPercents());
            }
        };
        window.addEventListener('resize', onResize, true);

        this.wavesurfer.on('destroy', function () {
            my.destroy.bind(this);
            window.removeEventListener('resize', onResize, true);
        });
    },

    bindMinimapEvents: function () {
        var my = this;
        var relativePositionX = 0;
        var seek = true;
        var positionMouseDown = {
            clientX: 0,
            clientY: 0
        };

        this.on('click', (function (e, position) {
            if (seek)  {
                this.progress(position);
                this.wavesurfer.seekAndCenter(position);
            } else {
                seek = true;
            }
        }).bind(this));

        if (this.params.showOverview) {
            this.overviewRegion.addEventListener('mousedown', function(event) {
                my.draggingOverview = true;
                relativePositionX = event.layerX;
                positionMouseDown.clientX = event.clientX;
                positionMouseDown.clientY = event.clientY;
            });

            this.wrapper.addEventListener('mousemove', function(event) {
                if(my.draggingOverview) {
                    my.moveOverviewRegion(event.clientX - my.container.getBoundingClientRect().left - relativePositionX);
                }
            });

            this.wrapper.addEventListener('mouseup', function(event) {
                if (positionMouseDown.clientX - event.clientX === 0 && positionMouseDown.clientX - event.clientX === 0) {
                    seek = true;
                    my.draggingOverview = false;
                } else if (my.draggingOverview)  {
                    seek = false;
                    my.draggingOverview = false;
                }
            });
        }
    },

    render: function () {
        var len = this.getWidth();
        var peaks = this.wavesurfer.backend.getPeaks(len);
        this.drawPeaks(peaks, len);

        if (this.params.showOverview) {
            //get proportional width of overview region considering the respective
            //width of the drawers
            this.ratio = this.wavesurfer.drawer.width / this.width;
            this.waveShowedWidth = this.wavesurfer.drawer.width / this.ratio;
            this.waveWidth = this.wavesurfer.drawer.width;
            this.overviewWidth = (this.width / this.ratio);
            this.overviewPosition = 0;
            this.overviewRegion.style.width = (this.overviewWidth - (this.params.overviewBorderSize * 2)) + 'px';
        }
    },
    moveOverviewRegion: function(pixels) {
        if (pixels < 0) {
            this.overviewPosition = 0;
        } else if (pixels + this.overviewWidth < this.width) {
            this.overviewPosition = pixels;
        } else {
            this.overviewPosition = (this.width - this.overviewWidth);
        }
        this.overviewRegion.style.left = this.overviewPosition + 'px';
        this.wavesurfer.drawer.wrapper.scrollLeft = this.overviewPosition * this.ratio;
    }
});

WaveSurfer.initMinimap = function (params) {
    var map = Object.create(WaveSurfer.Minimap);
    map.init(this, params);
    return map;
};

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
            loopOut: 0,
            maxVol: 1,
            cueActive: false
        };

        this.wavesurfer = Object.create(WaveSurfer);

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
            minimap: true,
            hideScrollbar: true,
            minPxPerSec: 50,
            pixelRatio: 1
        }

        this.wavesurfer.init(options);

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

            // TODO: Check if Safari has fixed the 302 redirect, if so just load the track
            Axios.get(`${nextProps.track.preview_url}?client_id=${clientId}&_status_code_map[302]=200`).then((track) => {
                this.wavesurfer.load(track.data.location);
            }).catch((error) => {
                console.log('error', error);
            });

            this.setState({
                playing: false,
                cues: []
            });

            this.wavesurfer.initMinimap({
                height: 30,
                waveColor: '#555',
                progressColor: '#222',
                cursorColor: 'black'
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

        if(newCues[index]) {
            this.setState({ playing: true });
            this.wavesurfer.play(newCues[index]);
        } else {
            newCues[index] = this.wavesurfer.getCurrentTime();
            this.setState({ cues: newCues });
        }
	}

    handleLoopIn() {
        this.setState({ loopIn: this.wavesurfer.getCurrentTime() });
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
            this.setState({ loopActive: false });
        } else {
            this.setState({ loopActive: true });
            this.wavesurfer.stop();
            this.playLoop();
        }
	}

    handleTempoChange() {
        let formatTempo = function(val) {
            if(val < 1) {
                return '-' + ((1-val)*100).toFixed(1) + '%';
            } else {
                val = '.' + val.split('.')[1];
                return '+' + (val*100).toFixed(1) + '%';
            }
        };
        this.setState({ tempo: formatTempo(this.refs.tempo.value) });
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

    playLoop() {
        this.setState({ loopActive: true });
        // this.wavesurfer.seekAndCenter(this.state.loopIn);
        this.wavesurfer.play(this.state.loopIn);
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
                        <div ref="wavesurfer" className={loading}></div>
                        <div className="tempo">
                            <input type="range" ref="tempo" onChange={this.handleTempoChange} min="0.9" max="1.1" step="0.001" className="slider slider-vertical" />
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
