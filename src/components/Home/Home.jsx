//imports
import "./Home.css";
import { NavigationContext } from "../Router/MyRouter";
import Logo from "./Logo";
import { auth } from "../../firebase";

//react imports
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MazeComponent from "../Maze/Maze";
import { createMazeFromBlocks } from "../../mazeGeneration/mazeGenerator";

//custom tool imports
import UserTools from "../../users/getUserID";
const userTool = new UserTools();

const Home = ({ setUserID }) => {
  const { setHasVisitedHome, resetNavigation } = useContext(NavigationContext);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    resetNavigation();
    setHasVisitedHome(true);
  }, [setHasVisitedHome, resetNavigation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user.displayName);
      } else {
        setFirebaseUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const navigate = useNavigate();

  const maze = createMazeFromBlocks(23);

  const signOut = () => {
    auth.signOut();
    setUserID(userTool.getUserID());
    setFirebaseUser(null);
  };

  return (
    <>
      {/* <div className="logo-container">
        <Logo />
      </div> */}
      <div className="home-maze-container">
        <div className="home-maze">
          <MazeComponent maze={maze} />
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
          {firebaseUser ? (
            <>
              <button className="nav-button" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-button"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
              <button className="nav-button" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default Home;
