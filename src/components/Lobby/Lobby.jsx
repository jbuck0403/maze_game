//reflect imports
import { Reflect } from "@rocicorp/reflect/client";
import { useSubscribe, usePresence } from "@rocicorp/reflect/react";
// import { useOrchestration } from "@rocicorp/reflect-orchestrator";
import { useOrchestration } from "reflect-orchestrator";
import { orchestrationOptions } from "../../../reflect/orchestration-options";
import { mutators } from "../../../reflect/mutators";
import { listClients } from "../../../reflect/mutators";

//react imports
import { useState, useEffect } from "react";

//component imports
import Game from "../Game/Game";

//tool imports
import MazeTools from "../../mazeGeneration/mazeTools";
import UserTools from "../../users/getUserID";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import CookieTools from "../../cookies/cookies";

const userTool = new UserTools();
let r;
// let playersInGame = [];

// find the userid via firebase or cookies, in that order
const userID = userTool.getUserID();
const server = "http://localhost:8080";

const Lobby = ({ setGameRoom, gameRoom, setStartingPlayers }) => {
  // const userID = nanoid();
  const navigate = useNavigate();
  console.log(userID);

  useEffect(() => {
    if (gameRoom) {
      navigate("/game");
    }
  }, [gameRoom, navigate]);

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

  useEffect(() => {
    if (!roomAssignment) {
      r = undefined;
      return;
    }
    r = new Reflect({
      server: server,
      roomID: roomAssignment.roomID,
      userID: userID,
      auth: userID,
      mutators,
    });

    console.log(r);
    r.mutate.initClient();

    return () => {
      r = undefined;
    };
  }, [roomAssignment]);

  // useEffect(() => {
  //   const mazeToolInit = new MazeTools(r);
  //   setMazeTool(mazeToolInit);
  // }, [r]);

  const handleForceStart = () => {
    r.mutate.forceStartOptIn(r.userID);
  };

  // const gameInProgress = useSubscribe(
  //   r,
  //   (tx) => tx.get("gameInProgress") ?? false
  // );
  const [forceStartOptedIn, setForceStartOptedIn] = useState(0);

  const startingPlayers = useSubscribe(r, (tx) => tx.get("startingPlayers"));
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

  console.log(presentClientIDs);

  if (roomAssignment) {
    console.log(roster, forceStartDict, presentClientIDs, presentUsers);
  }

  useEffect(() => {
    if (roomAssignment) {
      if (
        r &&
        presentUsers &&
        !presentUsers.includes(undefined) &&
        presentUsers.length > 0
      ) {
        console.log(presentUsers);
        r.mutate.initRoster(presentUsers);
      }
    }
  }, [presentUsers]);

  useEffect(() => {
    if (roomAssignment) {
      if (r) {
        r.mutate.initForceStartDict();
        r.mutate.setStartingPlayers();
      }
    }
  }, [roster]);

  useEffect(() => {
    if (roomAssignment) {
      if (
        startingPlayers &&
        (roster.length === orchestrationOptions.maxPerRoom ||
          (roster.length >= 2 && forceStartOptedIn >= 2))
      ) {
        if (roomAssignment.roomIsLocked === false) {
          roomAssignment.lockRoom();
          setGameRoom(r);
          setStartingPlayers(startingPlayers);
          // r.mutate.removeFromPlayerRoster(r.userID);
          // const gameRoom = new Reflect({
          //   server: server,
          //   roomID: roster.join(""),
          //   userID: userID,
          //   auth: userID,
          //   mutators,
          // });
          // console.log(gameRoom);
          // gameRoom.mutate.setStartingPlayers(startingPlayers);
          // gameRoom.mutate.addToPlayerRoster(r.userID);
          // gameRoom.mutate.setGameRoom(gameRoom);
          // setGameRoom(
          //   new Reflect({
          //     server: server,
          //     roomID: `${roster.join("")}`,
          //     userID: userID,
          //     auth: userID,
          //     mutators,
          //   })
          // );
          // navigate("/game");
          // r.close();
          // r.mutate.startGame();
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

  const leavingGameRoom = () => {
    // r.mutate.removeFromPlayerRoster(r.userID);
    userTool.clearUserIDCookie();
    // r.close();
  };

  useEffect(() => {
    window.addEventListener("unload", () => {
      leavingGameRoom();
      // r.mutate.stopGame();
      // r.close();
    });

    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });
  }, []);

  if (roomAssignment) {
    console.log(roster);
  }

  return (
    <>
      <button
        onClick={() => {
          leavingGameRoom();
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
              <div>
                {roster.map((player, idx) => {
                  return <div key={`${player}${idx}`}>{player}</div>;
                })}
              </div>
              <button onClick={() => handleForceStart()}>Force Start</button>
              <div>{`${forceStartOptedIn}/${roster.length}`}</div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Lobby;
