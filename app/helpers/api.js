import React from 'react';
import Axios from 'axios';

const clientId = '9dd85b3d536b3da895a951ddac00d6f8';

const Api = {
	getTracks: (query, tag) => {
		if(tag) {
			return Axios.get(`https://api.soundcloud.com/tracks?tags=${tag}&limit=100&duration[to]=500000&client_id=${clientId}`);
		} else {
			return Axios.get(`https://api.soundcloud.com/tracks?q=${query}&limit=100&duration[to]=500000&client_id=${clientId}`);
		}
	}
};

export default Api;
