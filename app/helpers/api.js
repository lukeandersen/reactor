import Axios from 'axios';

const Api = {
	getTracks: (query) => {
		return Axios.get('/api/tracks', {
			params: query ? { q: query } : {}
		});
	}
};

export default Api;
