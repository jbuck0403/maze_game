import "./Maze.css";

import { emptySpace, wall, artifact } from "../../mazeGeneration/mazeGenerator";

function MazeComponent({ maze, playerCollectedArtifactsAll }) {
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

  return (
    <>
      <div className="maze-game-container">
        <div className="score-column">
          <div className="score-container">
            <div className="score-title">{`Player 1`}</div>
            <div className="score player1-score">{`${playerCollectedArtifactsAll[0]}`}</div>
          </div>
          <div className="score-container">
            {playerCollectedArtifactsAll &&
              playerCollectedArtifactsAll.length == 4 && (
                <>
                  <div className="score-title">{`Player 4`}</div>
                  <div className="score player4-score">{`${playerCollectedArtifactsAll[3]}`}</div>
                </>
              )}
          </div>
        </div>
        <table className="maze">
          <tbody>{maze.map((row, yIndex) => displayRow(row, yIndex))}</tbody>
        </table>
        <div className="score-column">
          <div className="score-container">
            {playerCollectedArtifactsAll &&
              playerCollectedArtifactsAll.length >= 3 && (
                <>
                  <div className="score-title">{`Player 3`}</div>
                  <div className="score player3-score">{`${playerCollectedArtifactsAll[2]}`}</div>
                </>
              )}
          </div>
          <div className="score-container">
            <div className="score-title">{`Player 2`}</div>
            <div className="score player2-score">{`${playerCollectedArtifactsAll[1]}`}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MazeComponent;
