import React from 'react';
// import WaveSurfer from 'wavesurfer.js';
import Normalize from 'normalize.css';
import Styles from '../styles/main.css';
import Player from '../components/player';
// import Library from '../components/library';
import Api from '../helpers/api';

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
		// var wavesurfer = WaveSurfer.create({
		//     container: '.screen',
		//     waveColor: 'purple',
		//     cursorColor: 'red'
		// });
		Api.getTracks('Drake').then((response) => {
			// wavesurfer.load(response.data.tracks.items[0].preview_url);
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
	handlePlay() {
		wavesurfer.play();
	},
	handlePause() {
		wavesurfer.pause();
	},
	handleStop() {
		wavesurfer.stop();
	},
	render() {
		function formatTime(ms) {
			var min = (ms/1000/60) << 0,
		    	sec = ((ms/1000) % 60).toFixed(0);
			return min + ':' + sec;
		}
		// console.log('this.state', this.state);
		return (
			<div>
				<div className="decks">
					<Player name="A" track={this.state.deckA} />
					<Player name="B" track={this.state.deckB} />
				</div>
				<table className="table">
					<thead>
						<tr>
							<td>#</td>
							<td>Title</td>
							<td>Artist</td>
							<td>Popularity</td>
							<td>Duration</td>
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
