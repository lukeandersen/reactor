import React, {Component} from 'react';
import Api from '../helpers/api';
import Library from '../components/library';
import Player from '../components/player';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			tracks: [],
			deckA: {},
			deckB: {},
			xfade: 0
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.handleSelectTrack = this.handleSelectTrack.bind(this);
		this.handleCrossfader = this.handleCrossfader.bind(this);
		this.searchRef = React.createRef();
		this.xfaderRef = React.createRef();
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
		if(this.searchRef.current?.value !== null) {
			this.getTracks(this.searchRef.current.value);
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
		this.setState({ xfade: parseFloat(this.xfaderRef.current.value) });
	}

	render() {
		let {deckA, deckB, tracks, loading, xfade} = this.state;
		let	loadingText;
		loading ? loadingText = 'Loading...' : loadingText = null;

		return (
			<div>
				<div className="decks">
					<Player name="A" track={deckA} xfade={xfade} />
					<Player name="B" track={deckB} xfade={xfade} />
				</div>
				<div className="fader">
					<div className="item">
						<form className="search" onSubmit={this.handleSearch}>
							<input ref={this.searchRef} type="search" placeholder="Seach"/>
							<button type="submit">Go</button>
							<div className="searchStatus">{loadingText}</div>
						</form>
					</div>
					<div className="item">
						<div className="xfader">
							<span>A</span>
							<input className="slider" type="range" onChange={this.handleCrossfader} ref={this.xfaderRef} min="-1" max="1" step="0.01" value={xfade} />
							<span>B</span>
      					</div>
					</div>
					<div className="item">
							<img src="/soundcloud-logo-1.png" className="soundcloud" alt="SoundCloud"/>
					</div>
				</div>
				<Library tracks={tracks} selectTrack={this.handleSelectTrack} />
			</div>
		)
	}
}

export default Home;
