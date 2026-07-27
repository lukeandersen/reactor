import Axios from 'axios';
import { getSoundCloudAccessToken, soundCloudHeaders } from '../../lib/soundcloud';

export default async function handler(req, res) {
	try {
		const accessToken = await getSoundCloudAccessToken();
		const params = {
			limit: 100,
			access: 'playable',
			'duration[to]': 500000,
			linked_partitioning: true
		};

		if (typeof req.query.tag === 'string') params.tags = req.query.tag;
		if (typeof req.query.q === 'string') params.q = req.query.q;

		const response = await Axios.get('https://api.soundcloud.com/tracks', {
			headers: soundCloudHeaders(accessToken),
			params
		});
		const tracks = response.data.collection || response.data;

		res.status(200).json(tracks.map((track) => ({
			...track,
			stream_url: track.stream_url
				? `/api/stream?url=${encodeURIComponent(track.stream_url)}`
				: null
		})));
	} catch (error) {
		console.error('Unable to search SoundCloud tracks.', error.response?.data || error.message);
		res.status(error.response?.status || 500).json({ error: 'Unable to load SoundCloud tracks.' });
	}
}
