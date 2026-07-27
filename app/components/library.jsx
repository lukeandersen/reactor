import React from 'react';

const Library = (props) => {

	function formatTime(ms) {
		let minutes = Math.floor(ms / 60000),
			seconds = ((ms % 60000) / 1000).toFixed(0);
		return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	}

	return (
		<div>
			<table className="table">
				<thead>
					<tr>
						<td width="40">#</td>
						<td width="10%">Album</td>
						<td>Title</td>
						<td width="10%">Artist</td>
						<td width="10%">Genre</td>
						<td width="10%">Duration</td>
						<td width="10%">Play (Deck A/B)</td>
					</tr>
				</thead>
			</table>
			<div className="table-scroll">
				<table className="table">
					<tbody>
						{props.tracks.map((track, key) => {
							let img = {
								backgroundImage: track.artwork_url ? `url(${track.artwork_url})` : 'linear-gradient(to top, #555, #999)'
							};
							return (
								<tr key={key}>
									<td width="40">{key + 1}</td>
									<td width="55"><div className="artwork-strip" style={img}></div></td>
									<td>{track.title}</td>
									<td width="10%">{track.user.username}</td>
									<td width="10%">{track.genre}</td>
									<td width="10%">{formatTime(track.duration)}</td>
									<td width="10%"><button onClick={() => props.selectTrack(key, 'A')}>A</button> <button onClick={() => props.selectTrack(key, 'B')}>B</button></td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Library;
