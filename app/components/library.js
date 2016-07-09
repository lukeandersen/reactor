import React, {PropTypes} from 'react';

const Library = () => {
	return (
        <table className="table">
			<thead>
				<tr>
					<td>#</td>
					<td>Title</td>
					<td>Artist</td>
					<td>BPM</td>
					<td>Key</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1</td>
					<td>Best song in the world</td>
					<td>Drake</td>
					<td>128</td>
					<td>#E</td>
				</tr>
			</tbody>
        </table>
	);
};

export default Library;
