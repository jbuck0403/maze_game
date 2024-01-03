//firebase imports
// import { auth } from "./firebase";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import CookieTools from "../cookies/cookies";
import { nanoid } from "nanoid";

const cookieTool = new CookieTools();

export default class UserTools {
  getUserID() {
    const cookieUserName = cookieTool.getCookie("userID");
    const userID =
      cookieUserName === null
        ? cookieTool.setCookie("userID", `#anon${nanoid()}`)
        : cookieUserName;

    return userID;
  }

  async checkLoggedIn() {
    return new Promise(async (resolve) => {
      const user = await new Promise((innerResolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          innerResolve(user);
          unsubscribe();
        });
      });

      if (user) {
        resolve(user.displayName);
      } else {
        resolve(this.getUserID());
      }
    });
  }

  clearUserIDCookie() {
    cookieTool.clearCookie("userID");
  }
}
