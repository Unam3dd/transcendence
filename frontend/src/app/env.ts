const CLIENT_ID = 'u-s4t2ud-1797d9bf00415e2c434c540d187d18f12abb6be481dcc132c47cb84e823c1572';
const IP_SERVER = 'localhost';
const PORT = 3000;
const PROTO = 'https';
const REDIRECT_URI = `${PROTO}://${IP_SERVER}:3000/auth/callback`;
const PROD_REDIRECT_URI = `${PROTO}://localhost/api/auth/callback`;
const WS_GATEWAY = `${PROTO}://${IP_SERVER}`;
const NESTJS_URL = `${PROTO}://${IP_SERVER}:${PORT}`;
const PROD_NESTJS_URL = `${PROTO}://${IP_SERVER}/api/`
const LOGIN_PAGE = `${PROTO}://${IP_SERVER}:4200/`;
const HOME_PAGE = `${PROTO}://${IP_SERVER}:4200/home`;
const PROD_HOME_PAGE = `${PROTO}://${IP_SERVER}/home`;
const PROD_LOGIN_PAGE = `https://${IP_SERVER}/`;
const PROD_PROFILE_PAGE = `${PROTO}://${IP_SERVER}/profile`
const PROFILE_PAGE = `${PROTO}://${IP_SERVER}:4200/profile`;

export { CLIENT_ID, IP_SERVER, PORT, REDIRECT_URI, NESTJS_URL, WS_GATEWAY, PROTO, LOGIN_PAGE, PROD_LOGIN_PAGE, PROFILE_PAGE, PROD_HOME_PAGE, HOME_PAGE, PROD_PROFILE_PAGE, PROD_NESTJS_URL, PROD_REDIRECT_URI};
