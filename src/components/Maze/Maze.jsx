import "./Maze.css";

import { wall, artifact } from "../../mazeGeneration/mazeGenerator";

function MazeComponent({ maze }) {
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
        <table className="maze">
          <tbody>{maze.map((row, yIndex) => displayRow(row, yIndex))}</tbody>
        </table>
      </div>
    </>
  );
}

export default MazeComponent;
