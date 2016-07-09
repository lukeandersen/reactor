import React from 'react';
import Axios from 'axios';

const Api = {
	getTracks: (artist) => {
		return Axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=track`);
	}
};

export default Api;
