import React from 'react';
import { HashRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';
import Home from '../components/home';
import 'normalize.css';
import '../styles/main.css';

ReactGA.initialize('UA-00000000-0')

const history = createBrowserHistory()
history.listen((location) => {
    ReactGA.set({ page: location.pathname })
    ReactGA.pageview(location.pathname)
})

const Routes = (
	<HashRouter>
		<Home />
	</HashRouter>
);

export default Routes
