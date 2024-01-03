import "./Maze.css";

import { emptySpace, wall, artifact } from "../../mazeGeneration/mazeGenerator";

function MazeComponent({ maze, playerCollectedArtifactsAll, roster }) {
  const addClassName = (cell) => {
    switch (cell) {
      case wall:
        return "wall";
      case artifact:
        return "artifact";
      default:
        return "";
    }
  };
  const displayCell = (cell, xIndex, yIndex) => (
    <td
      key={`${xIndex}|${yIndex}`}
      // className={`cell ${cell == "x" ? "wall" : ""}`}
      className={`cell ${addClassName(cell)}`}
      id={`_${xIndex}-${yIndex}`}
    ></td>
  );

  const displayRow = (row, yIndex) => (
    <tr key={yIndex} className="row">
      {row.map((cell, xIndex) => displayCell(cell, xIndex, yIndex))}
    </tr>
  );

  const getPlayerName = (idx) => {
    if (roster[idx].length < 5) {
      return roster[idx];
    } else if (roster[idx].substring(0, 5) === "#anon") {
      return `player ${idx + 1}`;
    } else {
      return roster[idx];
    }
  };

  return (
    <>
      <div className="maze-game-container">
        {roster && (
          <>
            <div className="score-column">
              <div className="score-container">
                <div className="score-title">{getPlayerName(0)}</div>
                <div className="score player1-score">{`${playerCollectedArtifactsAll[0]}`}</div>
              </div>
              <div className="score-container">
                {playerCollectedArtifactsAll &&
                  playerCollectedArtifactsAll.length == 4 && (
                    <>
                      <div className="score-title">{getPlayerName(3)}</div>
                      <div className="score player4-score">{`${playerCollectedArtifactsAll[3]}`}</div>
                    </>
                  )}
              </div>
            </div>
          </>
        )}
        <table className="maze">
          <tbody>{maze.map((row, yIndex) => displayRow(row, yIndex))}</tbody>
        </table>
        {roster && (
          <>
            <div className="score-column">
              <div className="score-container">
                {playerCollectedArtifactsAll &&
                  playerCollectedArtifactsAll.length >= 3 && (
                    <>
                      <div className="score-title">{getPlayerName(2)}</div>
                      <div className="score player3-score">{`${playerCollectedArtifactsAll[2]}`}</div>
                    </>
                  )}
              </div>
              <div className="score-container">
                <div className="score-title">{getPlayerName(1)}</div>
                <div className="score player2-score">{`${playerCollectedArtifactsAll[1]}`}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default MazeComponent;
