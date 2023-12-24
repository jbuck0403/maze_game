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
// import { nanoid } from "nanoid";

const userTool = new UserTools();
let r;
// let playersInGame = [];

// find the userid via firebase or cookies, in that order
const userID = userTool.getUserID();
const server = "http://localhost:8080";

const Lobby = () => {
  const roomAssignment = useOrchestration(
    {
      server: server,
      roomID: "orchestrator",
      userID: userID,
      auth: userID,
    },
    orchestrationOptions
  );

  const [mazeTool, setMazeTool] = useState();

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

    r.mutate.initClient();

    setMazeTool();
    return () => {
      r = undefined;
    };
  }, [roomAssignment]);

  useEffect(() => {
    const mazeToolInit = new MazeTools(r);
    setMazeTool(mazeToolInit);
  }, [r]);

  const handleForceStart = () => {
    r.mutate.forceStartOptIn(r.userID);
  };

  const gameInProgress = useSubscribe(
    r,
    (tx) => tx.get("gameInProgress") ?? false
  );
  const startingPlayers = useSubscribe(r, (tx) => tx.get("startingPlayers"));
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
    if (!gameInProgress) {
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
    if (!gameInProgress) {
      if (r) {
        r.mutate.initForceStartDict();
        r.mutate.setStartingPlayers();
      }
    }
  }, [roster]);

  useEffect(() => {
    if (
      startingPlayers &&
      (roster.length === orchestrationOptions.maxPerRoom ||
        (roster.length >= 2 && forceStartOptedIn >= 2))
    ) {
      if (roomAssignment.roomIsLocked === false) {
        console.log("locking room and starting game");
        roomAssignment.lockRoom();
        r.mutate.startGame();
      }
    }
  }, [forceStartOptedIn, roster]);

  useEffect(() => {
    if (!gameInProgress) {
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

  console.log(
    roomAssignment,
    gameInProgress,
    roster,
    startingPlayers,
    roomAssignment?.roomIsLocked
  );
  return (
    <>
      {!gameInProgress && !roomAssignment?.roomIsLocked && roster && (
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

      <>
        {gameInProgress &&
          roomAssignment?.roomIsLocked &&
          startingPlayers &&
          mazeTool && (
            <Game r={r} mazeTool={mazeTool} startingPlayers={startingPlayers} />
          )}
      </>
    </>
  );
};

export default Lobby;
