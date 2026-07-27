import Axios from 'axios';

const Api = {
	getTracks: (query, tag) => {
		return Axios.get('/api/tracks', {
			params: tag ? { tag } : { q: query }
		});
	}
};

export default Api;
