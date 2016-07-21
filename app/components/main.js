import React, {Component} from 'react';

class Main extends Component {
	render() {
		return (
			<div>
				{/* Header */}
				{this.props.children}
				{/* Footer */}
			</div>
		)
	}
}

export default Main;
