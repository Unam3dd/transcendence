import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {

    //To get an instance of the server, so we can send message to every clients of the server and more
    @WebSocketServer()
    server: Server;

    //to stock client socket with the client username
    client_array = new Map<string, string>();


    //Detect clients connections
    handleConnection(client: Socket, ...args: string[]) {

        // get the username of the user that just connect
        const username = client.handshake.query.username;

        // stock the user socket and the username in the map array
        this.client_array.set(client.id, username as string);

        console.log("Client name = " + this.client_array.get(client.id) + ", with socket id = " + client.id + " just connected!");

        // send message to the client that listen a 'welcome' event
        client.emit('welcome', 'Welcome to the WebSocket server!');

        // send message to all clients of the server on 'reponse' event using the server instance
        this.server.emit('response', "A new client just connect");
    }


    // Define actions when receiving an event, 'message' event in this case
    @SubscribeMessage('message')
    receiveNewMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket){

        console.log("client name = " + this.client_array.get(client.id) + ", with socket id = " + client.id + " sent a message:");

        // Print the message received by a client
        console.log(message);

        // send hello to the client that listen a 'response' event
        client.emit('response', "hello");
    }


    //Detect clients disconnection
    handleDisconnect(client: Socket) {

        console.log("client name = " + this.client_array.get(client.id) + ", with socket id = " + client.id + " disconnected!");

        this.client_array.delete(client.id);

        // send message to all clients
        this.server.emit('response', "A new client just disconnect");
    }

}
