import Axios from 'axios';

let cachedToken;

export async function getSoundCloudAccessToken() {
	if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
		return cachedToken.value;
	}

	const { SOUNDCLOUD_CLIENT_ID, SOUNDCLOUD_CLIENT_SECRET } = process.env;
	if (!SOUNDCLOUD_CLIENT_ID || !SOUNDCLOUD_CLIENT_SECRET) {
		throw new Error('SoundCloud credentials are not configured.');
	}

	const response = await Axios.post(
		'https://secure.soundcloud.com/oauth/token',
		new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
		{
			auth: { username: SOUNDCLOUD_CLIENT_ID, password: SOUNDCLOUD_CLIENT_SECRET },
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}
	);

	cachedToken = {
		value: response.data.access_token,
		expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000
	};

	return cachedToken.value;
}

export function soundCloudHeaders(accessToken) {
	return {
		Accept: 'application/json; charset=utf-8',
		Authorization: `OAuth ${accessToken}`
	};
}
