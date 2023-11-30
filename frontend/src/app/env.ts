const DEV_MODE = 0;
const CLIENT_ID = 'u-s4t2ud-1797d9bf00415e2c434c540d187d18f12abb6be481dcc132c47cb84e823c1572';
const IP_SERVER = 'localhost';
const ANGULAR_DEV_PORT = 4200;
const NEST_PORT = 3000;
const WS_PORT = 3001;
const PROTO = DEV_MODE ? 'http' : 'https';
const REDIRECT_URI = DEV_MODE ? `${PROTO}://${IP_SERVER}:${NEST_PORT}/auth/callback` : `${PROTO}://${IP_SERVER}/api/auth/callback`;
const WS_GATEWAY = DEV_MODE ? `${PROTO}://${IP_SERVER}:${WS_PORT}` : `${PROTO}://${IP_SERVER}/`;
const NESTJS_URL = DEV_MODE ? `${PROTO}://${IP_SERVER}:${NEST_PORT}` : `${PROTO}://${IP_SERVER}/api/`;
const HOME_PAGE = DEV_MODE ? `${PROTO}://${IP_SERVER}:${ANGULAR_DEV_PORT}/home` : `${PROTO}://${IP_SERVER}/home`;
const LOGIN_PAGE = DEV_MODE ? `${PROTO}://${IP_SERVER}:${ANGULAR_DEV_PORT}/` : `${PROTO}://${IP_SERVER}/`;
const PROFILE_PAGE = DEV_MODE ? `${PROTO}://${IP_SERVER}:${ANGULAR_DEV_PORT}/profile` : `${PROTO}://${IP_SERVER}/profile`;

export { DEV_MODE, CLIENT_ID, IP_SERVER, ANGULAR_DEV_PORT, NEST_PORT, WS_PORT, PROTO, REDIRECT_URI, WS_GATEWAY, NESTJS_URL, HOME_PAGE, LOGIN_PAGE, PROFILE_PAGE};