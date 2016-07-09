import React, {PropTypes} from 'react';

const Player = () => {
	return (
        <div className="player">
            <div className="header">
                <div className="album"></div>
                <div className="header-body">
                    <div className="clearfix">
                        <h3 className="title">Loading...</h3>
                        <h3 className="time"></h3>
                    </div>
                    <div className="clearfix sub-title">
                        <p className="artist"></p>
                        <p className="pitch-val">0</p>
                    </div>
                </div>
                <div className="deck">A</div>
            </div>
            <div className="body">
                <div className="screen"></div>
                <div className="tempo">
                    <input type="range" min="0" max="2" step="0.01" className="pitch slider slider-vertical" />
                </div>
            </div>
            <div className="footer">
                <div>
                    <button className="play btn btn-lg">Play</button>
                    <button className="stop btn btn-lg">Stop</button>
                </div>

                <div className="hot-cue">
                    <button className="btn">1</button>
                    <button className="btn">2</button>
                    <button className="btn">3</button>
                    <button className="btn">4</button>
                    <button className="btn">5</button>
                    <button className="btn">6</button>
                </div>

                <div className="loop">
                    <div className="btn-group">
                        <button className="loop-in btn">In</button>
                        <button className="loop-out btn">Out</button>
                        <button className="loop-exit btn">Exit</button>
                    </div>
                </div>
            </div>
        </div>
	);
};

export default Player;
