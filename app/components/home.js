import React from 'react';
import Normalize from 'normalize.css';
import Styles from '../styles/main.css';
import Api from '../helpers/api';
import Player from '../components/player';
// import WaveSurfer from 'wavesurfer.js';
// import Library from '../components/library';

var Home = React.createClass({
	getInitialState() {
		return {
			tracks: [],
			deckA: {},
			deckB: {}
		}
	},
	getTracks(artist) {
		Api.getTracks(artist).then((response) => {
			return response.data;
		});
	},
	componentDidMount() {
		Api.getTracks('mgmt').then((response) => {
			this.setState({
				tracks: response.data.tracks.items,
				deckA: {
					name: response.data.tracks.items[0].name,
					artist: response.data.tracks.items[0].artists[0].name,
					album: response.data.tracks.items[0].album.images[2].url,
					preview_url: response.data.tracks.items[0].preview_url
				},
				deckB: {
					name: response.data.tracks.items[3].name,
					artist: response.data.tracks.items[3].artists[0].name,
					album: response.data.tracks.items[3].album.images[2].url,
					preview_url: response.data.tracks.items[3].preview_url
				}
			});
		});
	},
	handleSelectTrack(index) {
		this.setState({
			deckA: {
				name: this.state.tracks[index].name,
				artist: this.state.tracks[index].artists[0].name,
				album: this.state.tracks[index].album.images[2].url,
				preview_url: this.state.tracks[index].preview_url
			}
		});
	},
	render() {
		function formatTime(ms) {
			var min = (ms/1000/60) << 0,
		    	sec = ((ms/1000) % 60).toFixed(0);
			return min + ':' + sec;
		}
		return (
			<div>
				<div className="decks">
					<Player name="A" track={this.state.deckA} />
					<div className="mixer">
						<input className="slider slider-vertical" type="range"/>
						<input className="slider slider-vertical" type="range"/>
					</div>
					<Player name="B" track={this.state.deckB} />
				</div>
				<div className="fader">
					<input className="slider" type="range"/>
				</div>
				<table className="table">
					<thead>
						<tr>
							<td>#</td>
							<td>Title</td>
							<td>Artist</td>
							<td>Popularity</td>
							<td>Duration</td>
							<td>Deck</td>
						</tr>
					</thead>
					<tbody>
						{this.state.tracks.map((track, key) => {
							return (
								<tr key={key}>
									<td>{key + 1}</td>
									<td>{track.name}</td>
									<td>{track.artists[0].name}</td>
									<td>{track.popularity}</td>
									<td>{formatTime(track.duration_ms)}</td>
									<td><button onClick={() => this.handleSelectTrack(key)}>A</button> <button onClick={() => this.handleSelectTrack(key)}>B</button></td>
								</tr>
							)
						})}
					</tbody>
		        </table>
			</div>
		)
	}
});

module.exports = Home;
