import { useEffect } from "react";
import { useSubscribe } from "@rocicorp/reflect/react";
import Game from "../Game/Game";

const Lobby = ({ r, mazeTool }) => {
  const handleForceStart = () => {
    r.mutate.forceStartOptIn(r.userID);
  };
  const startingPlayers = useSubscribe(r, (tx) => tx.get("startingPlayers"));
  const forceStartDict = useSubscribe(r, (tx) => tx.get("forceStart"));
  let forceStart = false;

  console.log(startingPlayers);
  if (startingPlayers && startingPlayers.length == 3) {
    forceStart = true;
  }

  useEffect(() => {
    console.log(forceStartDict);
  }, [forceStartDict]);

  return (
    <>
      {!forceStart && (
        <button onClick={() => handleForceStart()}>Force Start</button>
      )}
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
