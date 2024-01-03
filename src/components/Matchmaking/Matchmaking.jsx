//reflect imports
import { useOrchestration } from "reflect-orchestrator";
import { orchestrationOptions } from "../../../reflect/orchestration-options";

export const server = "http://localhost:8080";

function Matchmaking({ userID, setRoomAssignment }) {
  const roomAssignment = useOrchestration(
    {
      server: server,
      roomID: "orchestrator",
      userID: userID,
      auth: userID,
    },
    orchestrationOptions
  );

  setRoomAssignment(roomAssignment);

  return <></>;
}
export default Matchmaking;
