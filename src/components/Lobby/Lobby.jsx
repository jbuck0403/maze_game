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

  const [r, setR] = useState();
  const [mazeTool, setMazeTool] = useState();

  useEffect(() => {
    if (!roomAssignment) {
      setR(undefined);
      return;
    }
    const reflect = new Reflect({
      server: server,
      roomID: roomAssignment.roomID,
      userID: userID,
      auth: userID,
      mutators,
    });
    reflect.mutate.addToPlayerRoster(userID);

    setR(reflect);
    setMazeTool();
    return () => {
      void reflect?.close();
      setR(undefined);
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
  let forceStart = false;

  console.log(startingPlayers);
  if (startingPlayers && startingPlayers.length == 2) {
    forceStart = true;
  }

  useEffect(() => {
    console.log(forceStartDict);
  }, [forceStartDict]);

  return (
    <>
      {!forceStart && roster && (
        <>
          <div>
            {roster.map((player, idx) => {
              return <div key={`${player}${idx}`}>{player}</div>;
            })}
          </div>
          <button onClick={() => handleForceStart()}>Force Start</button>
        </>
      )}
      {forceStart && (
        <Game r={r} mazeTool={mazeTool} startingPlayers={startingPlayers} />
      )}
    </>
  );
};
export default Lobby;
