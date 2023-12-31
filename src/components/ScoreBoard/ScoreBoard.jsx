const ScoreBoard = ({
  children,
  roster,
  playerCollectedArtifactsAll,
  gameOver,
  userID,
}) => {
  const getPlayerName = (idx) => {
    if (roster[idx].length < 5) {
      return roster[idx];
    } else if (roster[idx].substring(0, 5) === "#anon") {
      return `Player ${idx + 1}`;
    } else {
      return roster[idx];
    }
  };

  const homeBtnHandler = () => {
    window.location.href = "/";
  };

  return (
    <>
      {gameOver && (
        <div className="nav-button-container">
          <div className={`score player${gameOver}-score`}>
            {roster[gameOver - 1] === userID
              ? "You win!"
              : `${getPlayerName(gameOver - 1)} wins!`}
          </div>
          <button onClick={homeBtnHandler} className="nav-button">
            Home
          </button>
        </div>
      )}
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
        {children}
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
};
export default ScoreBoard;
