import React, {Component} from 'react';
import Api from '../helpers/api';
import Library from '../components/library';
import Player from '../components/player';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			error: null,
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
		this.setState({ loading: true, error: null });
		return Api.getTracks(search, tag).then((response) => {
			this.setState({
				tracks: response.data,
				loading: false
			});
			return response.data;
		}).catch((error) => {
			this.setState({
				loading: false,
				error: error.response?.data?.error || 'Unable to load Audius tracks.'
			});
			return [];
		});
	}

	handleSearch(e) {
		e.preventDefault();
		if(this.searchRef.current?.value) {
			this.getTracks(this.searchRef.current.value);
		}
	}

	componentDidMount() {
		this.getTracks().then((tracks) => {
			if (tracks.length >= 2) {
				this.handleSelectTrack(0, 'A');
				this.handleSelectTrack(1, 'B');
			}
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
		let {deckA, deckB, tracks, loading, error, xfade} = this.state;
		let	loadingText;
		loadingText = loading ? 'Loading...' : error;

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
							<span className="service-brand">Audius</span>
					</div>
				</div>
				<Library tracks={tracks} selectTrack={this.handleSelectTrack} />
			</div>
		)
	}
}

export default Home;
