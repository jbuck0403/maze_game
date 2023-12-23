//reflect imports
import { Reflect } from "@rocicorp/reflect/client";
import { useSubscribe } from "@rocicorp/reflect/react";
// import { useOrchestration } from "@rocicorp/reflect-orchestrator";
import { useOrchestration } from "reflect-orchestrator";
import { orchestrationOptions } from "../../../reflect/orchestration-options";
import { mutators } from "../../../reflect/mutators";

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
    r.mutate.addToPlayerRoster(userID);

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

  useEffect(() => {
    if (
      startingPlayers &&
      (roster.length === orchestrationOptions.maxUsersPerRoom ||
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

  const onWindowClose = (event) => {
    event.preventDefault();

    if (roomAssignment && !roomAssignment.roomisLocked) {
      r.mutate.removeFromPlayerRoster(r.userID);
      r.mutate.setStartingPlayers(
        roster.filter((user) => {
          return user !== r.userID;
        })
      );
      r.close();
    }
  };
  
  useEffect(() => {
    window.addEventListener("unload", onWindowClose);

    return () => {
      window.removeEventListener("unload", onWindowClose);
    };
  }, []);

  useEffect(() => {
    window.removeEventListener("unload", onWindowClose);

    // if (roomAssignment) {
    //   setGameRoom(
    //     new Reflect({
    //       server: server,
    //       roomID: `game_${roomAssignment.roomID}`,
    //       userID: userID,
    //       auth: userID,
    //       mutators,
    //     })
    //   );
    //   playersInGame = startingPlayers;
    //   // r.mutate.removeFromPlayerRoster(userID);
    //   r.close();
    // }
  }, [forceStart]);

  // useEffect(() => {
  //   if (gameRoom) {
  //     gameRoom.mutate.addToPlayerRoster(userID);
  //   }
  // }, [gameRoom]);

  // console.log(forceStart, roomAssignment.roomIsLocked)

  console.log(roster)

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
      {roomAssignment && roomAssignment.roomIsLocked && (
        <Game
          r={r}
          mazeTool={mazeTool}
          startingPlayers={startingPlayers}
        />
      )}
    </>
  );
};
export default Lobby;
