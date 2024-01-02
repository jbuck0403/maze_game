//firebase imports
// import { auth } from "./firebase";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import CookieTools from "../cookies/cookies";
import { nanoid } from "nanoid";

const cookieTool = new CookieTools();

export default class UserTools {
  getUserID() {
    const user = auth.currentUser?.email;
    if (user) {
      return user;
    } else {
      const cookieUserName = cookieTool.getCookie("userID");
      const userID =
        cookieUserName === null
          ? cookieTool.setCookie("userID", `#anon${nanoid()}`)
          : cookieUserName;

      return userID;
    }
  }

  clearUserIDCookie() {
    cookieTool.clearCookie("userID");
  }
}
