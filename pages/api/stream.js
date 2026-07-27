import Axios from 'axios';
import { getSoundCloudAccessToken, soundCloudHeaders } from '../../lib/soundcloud';

function isSoundCloudStreamUrl(value) {
	try {
		const url = new URL(value);
		return url.hostname === 'api.soundcloud.com' && /^\/tracks\/[^/]+\/stream$/.test(url.pathname);
	} catch {
		return false;
	}
}

export default async function handler(req, res) {
	if (typeof req.query.url !== 'string' || !isSoundCloudStreamUrl(req.query.url)) {
		return res.status(400).json({ error: 'Invalid SoundCloud stream URL.' });
	}

	try {
		const accessToken = await getSoundCloudAccessToken();
		const response = await Axios.get(req.query.url, {
			headers: soundCloudHeaders(accessToken),
			maxRedirects: 0,
			validateStatus: (status) => status >= 200 && status < 400,
			responseType: 'stream'
		});

		if (response.status >= 300 && response.headers.location) {
			return res.redirect(response.status, response.headers.location);
		}

		res.status(response.status);
		if (response.headers['content-type']) res.setHeader('Content-Type', response.headers['content-type']);
		response.data.pipe(res);
	} catch (error) {
		console.error('Unable to stream SoundCloud track.', error.response?.data || error.message);
		res.status(error.response?.status || 502).json({ error: 'Unable to stream SoundCloud track.' });
	}
}
