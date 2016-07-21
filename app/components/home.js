import React, {Component} from 'react';
import Normalize from 'normalize.css';
import Styles from '../styles/main.css';
import Api from '../helpers/api';
import Player from '../components/player';
import LogoImg from '../assets/soundcloud-logo-1.png';
import crossfader from 'crossfade';

var audioCtx = new AudioContext();

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tracks: [],
			deckA: {},
			deckB: {}
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.handleCrossfader = this.handleCrossfader.bind(this);
	}

	getTracks(search, tag) {
		return Api.getTracks(search, tag).then((response) => {
			this.setState({
				tracks: response.data
			});
		});
	}

	handleSearch(e) {
		e.preventDefault();
		if(this.refs.search.value !== null) {
			this.getTracks(this.refs.search.value);
		}
	}

	componentDidMount() {
		this.getTracks(null, 'dance').then(() => {
			// Load first two tracks
			this.handleSelectTrack(0, 'A');
			this.handleSelectTrack(1, 'B');
		});

		setTimeout(() => {
			console.log('audioCtx', audioCtx);
		}, 20000);
	}

	handleSelectTrack(index, deck) {
		let update = {
			['deck' + deck]: {
				name: this.state.tracks[index].title,
				artist: this.state.tracks[index].user.username,
				album: this.state.tracks[index].artwork_url,
				preview_url: this.state.tracks[index].stream_url
			}
		}
		this.setState(update);
	}

	handleCrossfader() {
		var c = crossfader(this.audioCtx, node1, node2);
		c.connect(context.destination);
		c.fade.value = parseFloat(this.refs.xfader.value);
	}

	render() {
		function formatTime(ms) {
			var min = (ms/1000/60) << 0,
		    	sec = ((ms/1000) % 60).toFixed(0);
			return min + ':' + sec;
		}
		let {deckA, deckB, tracks} = this.state;

		return (
			<div>
				<div className="decks">
					<Player name="A" track={deckA} ac={audioCtx} />
					<Player name="B" track={deckB} ac={audioCtx} />
				</div>
				<div className="fader">
					<div className="item">
						<form className="search" onSubmit={this.handleSearch}>
							<input ref="search" type="search" placeholder="Seach"/>
							<button type="submit">go</button>
						</form>
					</div>
					<div className="item">
						<input className="slider" type="range" onChange={this.handleCrossfader} ref="xfader" min="-1" max="1" step="0.01"/>
					</div>
					<div className="item">
						<img src={LogoImg} className="soundcloud" alt="soundcloud"/>
					</div>
				</div>
				<div className="table-wrapper">
					<table className="table">
						<thead>
							<tr>
								<td>#</td>
								<td>Album</td>
								<td>Title</td>
								<td>Artist</td>
								<td>Popularity</td>
								<td>Duration</td>
								<td>Load</td>
							</tr>
						</thead>
						<tbody>
							{tracks.map((track, key) => {
								let img = {
									backgroundImage: track.artwork_url ? `url(${track.artwork_url})` : 'linear-gradient(to top, #555, #999)'
								};
								return (
									<tr key={key}>
										<td>{key + 1}</td>
										<td><div className="artwork-strip" style={img}></div></td>
										<td>{track.title}</td>
										<td>{track.user.username}</td>
										<td>{track.likes_count}</td>
										<td>{formatTime(track.duration)}</td>
										<td><button onClick={() => this.handleSelectTrack(key, 'A')}>A</button> <button onClick={() => this.handleSelectTrack(key, 'B')}>B</button></td>
									</tr>
								)
							})}
						</tbody>
			        </table>
				</div>
			</div>
		)
	}
}

export default Home;
