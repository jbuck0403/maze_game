//imports
import "./Home.css";
import { NavigationContext } from "../../App";

//react imports
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MazeComponent from "../Maze/Maze";
import { createMazeFromBlocks } from "../../mazeGeneration/mazeGenerator";

const Home = () => {
  const { setHasVisitedHome, resetNavigation } = useContext(NavigationContext);

  useEffect(() => {
    resetNavigation();
    setHasVisitedHome(true);
  }, [setHasVisitedHome, resetNavigation]);

  const navigate = useNavigate();

  const maze = createMazeFromBlocks(30);

  return (
    <>
      <div className="home-maze-container">
        <div className="home-maze">
          <MazeComponent maze={maze} playerCollectedArtifactsAll={[]} />
        </div>
        <div className="nav-button-container">
          <button
            className="nav-button"
            onClick={() => {
              navigate("/lobby");
            }}
          >
            Play
          </button>
          <button className="nav-button" onClick={() => navigate("/HowToPlay")}>
            How to Play
          </button>
        </div>
      </div>
    </>
  );
};
export default Home;
