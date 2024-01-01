//imports
import "./Lobby.css";
import { server } from "../../App";
import { NavigationContext } from "../../App";

//reflect imports
import { Reflect } from "@rocicorp/reflect/client";
import { useSubscribe, usePresence } from "@rocicorp/reflect/react";
import { orchestrationOptions } from "../../../reflect/orchestration-options";
import { mutators } from "../../../reflect/mutators";
import { listClients } from "../../../reflect/mutators";

//react imports
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

//tool imports
import UserTools from "../../users/getUserID";

const userTool = new UserTools();

const Lobby = ({
  setGameRoom,
  gameRoom,
  setStartingPlayers,
  roomAssignment,
}) => {
  //protected route logic
  const navigate = useNavigate();
  const context = useContext(NavigationContext);

  useEffect(() => {
    if (!context.hasVisitedHome) {
      navigate("/");
    }
  }, [context]);

  useEffect(() => {
    context.setHasVisitedLobby(true);
  });

  useEffect(() => {
    if (gameRoom) {
      navigate("/game");
    }
  }, [gameRoom]);

  //lobby logic
  const userID = userTool.getUserID();

  const [r, setR] = useState();

  useEffect(() => {
    if (!roomAssignment) {
      setR(undefined);
      return;
    }
    const room = new Reflect({
      server: server,
      roomID: roomAssignment.roomID,
      userID: userID,
      auth: userID,
      mutators,
    });

    setR(room);

    return () => {
      setR(undefined);
    };
  }, [roomAssignment]);

  useEffect(() => {
    if (r) {
      r.mutate.initClient();
    }
  }, [r]);

  const handleForceStart = () => {
    r.mutate.forceStartOptIn(r.userID);
  };

  const [forceStartOptedIn, setForceStartOptedIn] = useState(0);

  const roster = useSubscribe(r, (tx) => tx.get("roster"));
  const forceStartDict = useSubscribe(r, (tx) => tx.get("forceStart"));
  const presentClientIDs = usePresence(r);
  const presentUsers = useSubscribe(
    r,
    async (tx) => {
      const clients = await listClients(tx);
      const filteredUserIDs = clients
        .filter((c) => presentClientIDs.indexOf(c.id) > -1)
        .map((c) => {
          if (c.userID !== null && c.userID !== undefined) {
            return c.userID;
          }
        });
      const userIDSet = new Set(filteredUserIDs);
      return [...userIDSet];
    },
    [],
    [presentClientIDs]
  );

  useEffect(() => {
    if (roomAssignment) {
      if (
        r &&
        presentUsers &&
        !presentUsers.includes(undefined) &&
        presentUsers.length > 0
      ) {
        r.mutate.initRoster(presentUsers);
      }
    }
  }, [presentUsers]);

  useEffect(() => {
    if (roomAssignment) {
      if (r) {
        r.mutate.initForceStartDict();
      }
    }
  }, [roster]);

  useEffect(() => {
    const generateStartingPlayers = () => {
      const startingPlayersTemp = [];
      for (let i = 1; i <= roster.length; i++) {
        startingPlayersTemp.push(i);
      }
      return startingPlayersTemp;
    };
    if (roomAssignment && roster) {
      if (
        roster.length === orchestrationOptions.maxPerRoom ||
        (roster.length >= 2 && forceStartOptedIn >= 2)
      ) {
        if (roomAssignment.roomIsLocked === false) {
          console.log("moving to game");
          roomAssignment.lockRoom();
          setStartingPlayers(generateStartingPlayers());
          setGameRoom(r);
        }
      }
    }
  }, [forceStartOptedIn, roster]);

  useEffect(() => {
    if (roomAssignment) {
      if (forceStartDict !== undefined) {
        setForceStartOptedIn(
          Object.keys(forceStartDict).reduce((acc, key) => {
            if (forceStartDict[key]) {
              acc += 1;
            }

            return acc;
          }, 0)
        );
      }
    }
  }, [forceStartDict]);

  const handleLeaveLobby = () => {
    if (r) {
      r.close();
    }
  };

  const handleAttemptToLeavePage = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };

  useEffect(() => {
    window.addEventListener("unload", () => {
      handleLeaveLobby();
    });

    // window.addEventListener("beforeunload", handleAttemptToLeavePage);

    return () => {
      window.removeEventListener("unload", handleLeaveLobby);
      // window.removeEventListener("beforeunload", handleLeaveLobby);
    };
  }, []);

  console.log(roomAssignment, roster);

  return (
    <>
      <button
        className="nav-button smaller"
        onClick={() => {
          handleLeaveLobby();
          navigate("/");
        }}
      >
        Home
      </button>
      {roster && (
        <>
          {roster.length == 1 && <h1>Waiting for Match...</h1>}
          {/* force start code to handle up to 4 players */}
          {roster.length >= 2 && (
            <>
              <div className="lobby-players-container">
                <div className="user">Players in Lobby</div>
                <div className="user">{`${roster.length} / 4`}</div>
              </div>
              <button
                className="nav-button force-start-button"
                onClick={() => handleForceStart()}
              >
                Force Start
              </button>
              <div>{`${forceStartOptedIn} / ${roster.length}`}</div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Lobby;
