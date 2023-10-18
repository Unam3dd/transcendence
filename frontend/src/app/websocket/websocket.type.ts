import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
export type WsClient = Socket<DefaultEventsMap, DefaultEventsMap>