//imports
import "./App.css";

//react imports
import React, { useEffect } from "react";
import { useState } from "react";

//component imports
import { MyRouter } from "./components/Router/MyRouter";

//custom tool imports
import UserTools from "./users/getUserID";

const userTool = new UserTools();
export const server = "http://localhost:8080";

function App() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [userID, setUserID] = useState();

  useEffect(() => {
    async function fetchUserID() {
      const id = await userTool.checkLoggedIn();
      setUserID(id);
    }

    fetchUserID();
  }, []);

  useEffect(() => {
    console.log(userID);
  }, [userID]);

  return <>{userID && <MyRouter userID={userID} />}</>;
}
export default App;
