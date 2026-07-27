import Axios from 'axios';
const AUDIUS_API_URL = 'https://api.audius.co/v1';

function toLibraryTrack(track) {
	return {
		id: track.id,
		title: track.title,
		artwork_url: track.artwork?.['480x480'] || track.artwork?.['150x150'] || null,
		user: {
			username: track.user?.name || track.user?.handle || 'Unknown artist'
		},
		genre: track.genre || '',
		duration: track.duration * 1000,
		stream_url: track.stream.url
	};
}

export default async function handler(req, res) {
	try {
		const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
		const response = await Axios.get(
			query ? `${AUDIUS_API_URL}/tracks/search` : `${AUDIUS_API_URL}/tracks/trending`,
			{
				params: query ? { query, limit: 100 } : { limit: 100 },
				timeout: 10_000
			}
		);
		const tracks = Array.isArray(response.data.data) ? response.data.data : [];

		res.status(200).json(
			tracks
				.filter((track) => track.is_streamable && track.stream?.url)
				.map(toLibraryTrack)
		);
	} catch (error) {
		console.error('Unable to search Audius tracks.', error.response?.data || error.message);
		res.status(error.response?.status || 502).json({ error: 'Unable to load Audius tracks.' });
	}
}
