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
// let playersInGame = [];jik

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
  const [forceStartOptedIn, setForceStartOptedIn] = useState(0);
  const [forceStart, setForceStart] = useState(false);
  // const [gameRoom, setGameRoom] = useState();

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
    // r.mutate.addToPlayerRoster(userID);
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

  const roster = useSubscribe(r, (tx) => tx.get("roster"));
  const startingPlayers = useSubscribe(r, (tx) => tx.get("startingPlayers"));
  const forceStartDict = useSubscribe(r, (tx) => tx.get("forceStart"));
  const presentClientIDs = usePresence(r);
  const presentUsers = useSubscribe(
    r,
    async (tx) => {
      const clients = await listClients(tx);
      const filteredUserIDs = clients
        .filter((c) => presentClientIDs.indexOf(c.id) > -1)
        .map((c) => {
          if (c.userID !== null) {
            return c.userID;
          }
        });
      const userIDSet = new Set(filteredUserIDs);
      return [...userIDSet];
    },
    [],
    [presentClientIDs]
  );

  console.log(presentUsers);
  useEffect(() => {
    if (r && presentUsers && presentUsers.length > 0) {
      r.mutate.initRoster(presentUsers);
    }
  }, [presentUsers]);

  // console.log(startingPlayers);
  useEffect(() => {
    if (r) {
      r.mutate.initForceStartDict();
      r.mutate.setStartingPlayers();
    }
  }, [roster]);

  useEffect(() => {
    if (
      startingPlayers &&
      (roster.length === orchestrationOptions.maxPerRoom ||
        (roster.length >= 2 && forceStartOptedIn >= 2))
    ) {
      if (roomAssignment.roomIsLocked === false) {
        setForceStart(true);
        roomAssignment.lockRoom();
      }
    }
  }, [forceStartOptedIn, roster]);

  useEffect(() => {
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
  }, [forceStartDict]);

  // const onWindowClose = (event) => {
  //   // event.preventDefault();
  //   r.mutate.test();
  //   // if (roomAssignment && !roomAssignment.roomIsLocked) {
  //   r.mutate.removeFromPlayerRoster(r.userID);
  //   // r.mutate.setStartingPlayers()
  //   r.close();
  //   // }
  // };

  // useEffect(() => {
  //   // console.log("adding event listener");
  //   window.addEventListener("unload", onWindowClose);

  //   // return () => {
  //   //   // onWindowClose();
  //   //   window.removeEventListener("unload", onWindowClose);
  //   // };
  // });

  // useEffect(() => {
  //   if (forceStart) {
  //     window.removeEventListener("unload", onWindowClose);
  //   }

  //   // if (roomAssignment) {
  //   //   setGameRoom(
  //   //     new Reflect({
  //   //       server: server,
  //   //       roomID: `game_${roomAssignment.roomID}`,
  //   //       userID: userID,
  //   //       auth: userID,
  //   //       mutators,
  //   //     })
  //   //   );
  //   //   playersInGame = startingPlayers;
  //   //   // r.mutate.removeFromPlayerRoster(userID);
  //   //   r.close();
  //   // }
  // }, [forceStart]);

  // useEffect(() => {
  //   if (gameRoom) {
  //     gameRoom.mutate.addToPlayerRoster(userID);
  //   }
  // }, [gameRoom]);

  // console.log(forceStart, roomAssignment.roomIsLocked)

  // console.log(roster, startingPlayers, forceStartDict, mazeTool)
  // console.log(roomAssignment, roomAssignment?.roomIsLocked);

  return (
    <>
      {roomAssignment && !roomAssignment.roomIsLocked && roster && (
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
      {roomAssignment &&
        roomAssignment.roomIsLocked &&
        startingPlayers &&
        mazeTool && (
          <Game r={r} mazeTool={mazeTool} startingPlayers={startingPlayers} />
        )}
    </>
  );
};
export default Lobby;
