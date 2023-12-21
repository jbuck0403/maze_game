//reflect imports
import { Reflect } from "@rocicorp/reflect/client";
import { useSubscribe } from "@rocicorp/reflect/react";
import { useOrchestration } from "@rocicorp/reflect-orchestrator";
import { orchestrationOptions } from "../../../reflect/orchestration-options";
import { mutators } from "../../../reflect/mutators";

//react imports
import { useState, useEffect } from "react";

//component imports
import Game from "../Game/Game";

//tool imports
import MazeTools from "../../mazeGeneration/mazeTools";
import UserTools from "../../users/getUserID";

const userTool = new UserTools();
let r;

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
      void r?.close();
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

  console.log(startingPlayers);
  console.log(roster);

  useEffect(() => {
    if (
      startingPlayers &&
      (roster.length == 4 || (roster.length >= 2 && forceStartOptedIn >= 2))
    ) {
      setForceStart(true);
    }
  }, [forceStartOptedIn]);

  useEffect(() => {
    console.log(forceStartDict);
    if (forceStartDict !== undefined) {
      console.log(Object.keys(forceStartDict));
      setForceStartOptedIn(
        Object.keys(forceStartDict).reduce((acc, key) => {
          if (forceStartDict[key]) {
            acc += 1;
          }
          console.log(acc);
          return acc;
        }, 0)
      );
    }
  }, [forceStartDict]);

  const onWindowClose = (event) => {
    event.preventDefault();

    if (!forceStart) {
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
  }, [forceStart]);

  return (
    <>
      {!forceStart && roster && (
        <>
          <div>
            {roster.map((player, idx) => {
              return <div key={`${player}${idx}`}>{player}</div>;
            })}
          </div>
          {roster.length >= 2 && (
            <>
              <button onClick={() => handleForceStart()}>Force Start</button>
              <div>{`${forceStartOptedIn}/${roster.length}`}</div>
            </>
          )}
        </>
      )}
      {forceStart && (
        <Game r={r} mazeTool={mazeTool} startingPlayers={startingPlayers} />
      )}
    </>
  );
};
export default Lobby;
