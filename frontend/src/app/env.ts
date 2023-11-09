const CLIENT_ID = 'u-s4t2ud-1797d9bf00415e2c434c540d187d18f12abb6be481dcc132c47cb84e823c1572';
const IP_SERVER = 'localhost';
const PORT = 3000;
const REDIRECT_URI = `http://${IP_SERVER}:3000/auth/callback`;
const PROTO = 'http';
const WS_PORT = 3001;
const WS_GATEWAY = `${PROTO}://${IP_SERVER}:${WS_PORT}/events`;
const NESTJS_URL = `${PROTO}://${IP_SERVER}:${PORT}`;
const LOGIN_PAGE = `${PROTO}://${IP_SERVER}:4200/`;
const HOME_PAGE = `${PROTO}://${IP_SERVER}:4200/home`;
const PROD_HOME_PAGE = `${PROTO}://${IP_SERVER}/home`;
const PROD_LOGIN_PAGE = `https://${IP_SERVER}/`;
const PROFILE_PAGE = `${PROTO}://${IP_SERVER}:4200/profile`;

export { CLIENT_ID, IP_SERVER, PORT, REDIRECT_URI, NESTJS_URL, WS_PORT, WS_GATEWAY, PROTO, LOGIN_PAGE, PROD_LOGIN_PAGE, PROFILE_PAGE, PROD_HOME_PAGE, HOME_PAGE};
