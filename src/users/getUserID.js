import CookieTools from "../cookies/cookies";

const cookieTool = new CookieTools();

export default class UserTools {
  getUserID() {
    //check to see if user has logged in via firebase
    //  if user has logged in via firebase
    //    return firebase userID
    const cookieUserName = cookieTool.getCookie("userID");
    const userID =
      cookieUserName === null
        ? cookieTool.setCookie("userID", nanoid())
        : cookieUserName;

    return userID;
  }
}
