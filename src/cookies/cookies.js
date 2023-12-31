export default class CookieTools {
  getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  setCookie(name, value, daysToExpire = 1) {
    const date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;

    return value;
  }

  clearCookie(name) {
    document.cookie = `${name}=DELETING;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
}
