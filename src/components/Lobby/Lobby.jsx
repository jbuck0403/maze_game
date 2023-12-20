import { useEffect } from "react";
import { useSubscribe } from "@rocicorp/reflect/react";
import Game from "../Game/Game";

const Lobby = ({ r, mazeTool }) => {
  const startingPlayers = useSubscribe(r, (tx) => tx.get("startingPlayers"));
  let forceStart = false;

  console.log(startingPlayers);
  if (startingPlayers && startingPlayers.length == 2) {
    forceStart = true;
  }

  return (
    <>
      {forceStart && (
        <Game r={r} mazeTool={mazeTool} startingPlayers={startingPlayers} />
      )}
    </>
  );
};
export default Lobby;

/*
mount this route when players press "play" on the home page
on mount
    use orchestrator to assign a room
    
    display the current users in the room
*/
