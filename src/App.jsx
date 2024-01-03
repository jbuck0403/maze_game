//imports
import "./App.css";

//react imports
import React, { useEffect } from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//reflect imports
import { useOrchestration } from "reflect-orchestrator";
import { orchestrationOptions } from "../reflect/orchestration-options";

//component imports
import Lobby from "./components/Lobby/Lobby";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import HowToPlay from "./components/HowToPlay/HowToPlay";
import Login from "./components/Login/Login";
import SignUp from "./components/Signup/SignUp";

//custom tool imports
import UserTools from "./users/getUserID";

const userTool = new UserTools();
export const server = "http://localhost:8080";

export const NavigationContext = React.createContext({
  hasVisitedHome: false,
  setHasVisitedHome: () => {},
  hasVisitedLobby: false,
  setHasVisitedLobby: () => {},
  resetNavigation: () => {},
  homeRoute: "/",
  lobbyRoute: "/lobby",
  gameRoute: "/game",
});

function App() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [hasVisitedHome, setHasVisitedHome] = useState(false);
  const [hasVisitedLobby, setHasVisitedLobby] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState();

  const resetNavigation = () => {
    setHasVisitedHome(false);
    setHasVisitedLobby(false);
  };

  const userID = userTool.getUserID();
  console.log(userID);

  // useEffect(() => {
  //   console.log(userID);
  // }, [userID]);

  const roomAssignment = useOrchestration(
    {
      server: server,
      roomID: "orchestrator",
      userID: userID,
      auth: userID,
    },
    orchestrationOptions
  );

  console.log(roomAssignment);

  const [gameRoom, setGameRoom] = useState();
  const [startingPlayers, setStartingPlayers] = useState();

  function ProtectedRoute({ children, redirectTo, condition }) {
    return condition ? children : <Navigate to={redirectTo} />;
  }

  return (
    <NavigationContext.Provider
      value={{
        hasVisitedHome,
        setHasVisitedHome,
        hasVisitedLobby,
        setHasVisitedLobby,
        resetNavigation,
      }}
    >
      <Router>
        {/* <OverflowStyleComponent> */}
        <Routes>
          <Route path="/" element={<Home matchmaking={roomAssignment} />} />
          <Route path="/login" element={<Login user={firebaseUser} />} />
          <Route
            path="/signup"
            element={<SignUp setFirebaseUser={setFirebaseUser} />}
          />
          <Route path="/HowToPlay" element={<HowToPlay />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute condition={hasVisitedHome} redirectTo={"/"}>
                {roomAssignment && (
                  <Lobby
                    setGameRoom={setGameRoom}
                    setStartingPlayers={setStartingPlayers}
                    gameRoom={gameRoom}
                    roomAssignment={roomAssignment}
                  />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedRoute condition={hasVisitedLobby} redirectTo={"/"}>
                {gameRoom && (
                  <Game r={gameRoom} startingPlayers={startingPlayers} />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
        {/* </OverflowStyleComponent> */}
      </Router>
    </NavigationContext.Provider>
  );
}
export default App;
