import { getCookie, setCookie } from "./cookies";

export default class UserTools {
  getUserID() {
    //check to see if user has logged in via firebase
    //  if user has logged in via firebase
    //    return firebase userID
    const cookieUserName = getCookie("userID");
    const userID =
      cookieUserName === null ? setCookie("userID", nanoid()) : cookieUserName;

    return userID;
  }
}
