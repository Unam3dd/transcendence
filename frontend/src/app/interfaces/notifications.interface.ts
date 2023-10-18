export enum Action {
    friends_request, 
    game_invitation
  }

export interface notificationsInterface{
    sender_name: string,
    text: string,
    action: Action,
    sender_id: number
  }