import "./HowToPlay.css";

import { useNavigate } from "react-router-dom";

const HowToPlay = () => {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate("/")}>Home</button>
      <div className="how-to-container">
        <div className="title">Controls</div>
        <div>
          <div className="control-title">wasd</div>
          <div className="content">
            <div>Moves your character</div>
          </div>
          <div className="control-title">arrow keys</div>
          <div className="content">
            <div>
              Place walls in the chosen direction next to your character
            </div>
            <div>
              Can only place two walls at a time - any subsequent will replace
              the oldest one placed
            </div>
          </div>
          <div className="control-title">space bar</div>
          <div className="content">
            <div>Removes any walls you placed</div>
          </div>
          <div className="control-title">q</div>
          <div className="content">
            <div>
              Destroys walls directly adjacent to the player
              <div>
                <div>This ability has a 10 second cooldown</div>
              </div>
            </div>
          </div>
          <div className="control-title">e</div>
          <div className="content">
            <div>Attacks players directly adjacent to the player</div>
            <div>Only players with 2 or more artifacts can be attacked</div>
            <div className="sub-title">Attacking a player this way will:</div>
            <ol className="explanation-list">
              <li>Randomly respawn that player somewhere in the maze</li>
              <li>Immediately spawn one artifact back in the maze</li>
              <li>Remove one artifact from their possession</li>
            </ol>
          </div>
        </div>
        <div className="objective-wrapper">
          <div className="objective-container">
            <div className="purple-square"></div>
            <div className="title">Objective</div>
            <div className="purple-square"></div>
          </div>
        </div>
        <div className="win-condition-explanation-container">
          <div>
            There are two ways to win in the maze:
            <ul>
              <li className="win-condition-explanation">
                Collect all 5 artifacts to win immediately
              </li>
              <li className="win-condition-explanation">
                Collect and hold 3 or more artifacts for 15 seconds
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
export default HowToPlay;
