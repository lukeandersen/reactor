import React, {Component} from 'react';
import Normalize from 'normalize.css';
import Styles from '../styles/main.css';
import Api from '../helpers/api';
import Player from '../components/player';
import LogoImg from '../assets/soundcloud-logo.png';
// import Library from '../components/library';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tracks: [],
			deckA: {},
			deckB: {}
		};
	}

	getTracks(artist) {
		Api.getTracks(artist).then((response) => {
			return response.data;
		});
	}

	componentDidMount() {
		Api.getTracks('dance').then((response) => {
			this.setState({
				tracks: response.data,
				deckA: {
					name: response.data[0].title,
					artist: response.data[0].user.username,
					album: response.data[0].artwork_url,
					preview_url: response.data[0].stream_url
				},
				deckB: {
					name: response.data[1].title,
					artist: response.data[1].user.username,
					album: response.data[1].artwork_url,
					preview_url: response.data[1].stream_url
				}
			});
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
					<Player name="A" track={deckA} />
					<Player name="B" track={deckB} />
				</div>
				<div className="fader">
					<input className="slider" type="range"/>
					<img src={LogoImg} className="soundcloud" alt="soundcloud"/>
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
									backgroundImage: `url(${track.artwork_url})`
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
