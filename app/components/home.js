import React, {Component} from 'react';
import Normalize from 'normalize.css';
import Styles from '../styles/main.css';
import Api from '../helpers/api';
import Player from '../components/player';
import LogoImg from '../assets/soundcloud-logo-1.png';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			tracks: [],
			deckA: {},
			deckB: {},
			xfade: 0.5
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.handleCrossfader = this.handleCrossfader.bind(this);
	}

	getTracks(search, tag) {
		this.setState({ loading: true });
		return Api.getTracks(search, tag).then((response) => {
			this.setState({
				tracks: response.data,
				loading: false
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
		this.setState({
			xfade: parseFloat(this.refs.xfader.value)
		});
	}

	render() {
		function formatTime(ms) {
			let minutes = Math.floor(ms / 60000),
				seconds = ((ms % 60000) / 1000).toFixed(0);
			return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	    }

		let {deckA, deckB, tracks, loading, ac} = this.state;

		var loadingText;
		if (loading) {
			loadingText = 'Loading...';
		} else {
			loadingText = null;
		}

		return (
			<div>
				<div className="decks">
					<Player name="A" track={deckA} xfade={this.state.xfade} />
					<Player name="B" track={deckB} xfade={this.state.xfade} />
				</div>
				<div className="fader">
					<div className="item">
						<form className="search" onSubmit={this.handleSearch}>
							<input ref="search" type="search" placeholder="Seach"/>
							<button type="submit">go</button>
							<div className="searchStatus">{loadingText}</div>
						</form>
					</div>
					<div className="item">
						<input className="slider" type="range" onChange={this.handleCrossfader} ref="xfader" min="-1" max="1" step="0.01"/>
					</div>
					<div className="item">
						<img src={LogoImg} className="soundcloud" alt="soundcloud"/>
					</div>
				</div>
				<table className="table">
					<thead>
						<tr>
							<td width="40">#</td>
							<td width="10%">Album</td>
							<td>Title</td>
							<td width="10%">Artist</td>
							<td width="10%">Popularity</td>
							<td width="10%">Duration</td>
							<td width="10%">Load</td>
						</tr>
					</thead>
				</table>
				<div className="table-scroll">
					<table className="table">
						<tbody>
							{tracks.map((track, key) => {
								let img = {
									backgroundImage: track.artwork_url ? `url(${track.artwork_url})` : 'linear-gradient(to top, #555, #999)'
								};
								return (
									<tr key={key}>
										<td width="40">{key + 1}</td>
										<td width="10%"><div className="artwork-strip" style={img}></div></td>
										<td>{track.title}</td>
										<td width="10%">{track.user.username}</td>
										<td width="10%">{track.likes_count}</td>
										<td width="10%">{formatTime(track.duration)}</td>
										<td width="10%"><button onClick={() => this.handleSelectTrack(key, 'A')}>A</button> <button onClick={() => this.handleSelectTrack(key, 'B')}>B</button></td>
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
