import React from 'react';
import Axios from 'axios';

const clientId = '9dd85b3d536b3da895a951ddac00d6f8';

const Api = {
	getTracks: (artist) => {
		return Axios.get(`https://api.soundcloud.com/tracks?tags=${artist}&limit=100&client_id=${clientId}`);
	}
};

export default Api;
