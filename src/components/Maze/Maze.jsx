import "./Maze.css";

function MazeComponent({ maze }) {
  const displayCell = (cell, xIndex, yIndex) => (
    <td
      key={`${xIndex}|${yIndex}`}
      className={`cell ${cell == "x" ? "wall" : ""}`}
      id={`_${xIndex}-${yIndex}`}
    ></td>
  );

  const displayRow = (row, yIndex) => (
    <tr key={yIndex} className="row">
      {row.map((cell, xIndex) => displayCell(cell, xIndex, yIndex))}
    </tr>
  );

  return (
    <table className="maze">
      <tbody>{maze.map((row, yIndex) => displayRow(row, yIndex))}</tbody>
    </table>
  );
}

export default MazeComponent;