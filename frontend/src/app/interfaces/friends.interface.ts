import { OnlineState } from "../enum/status.enum";

export interface Friends{
    id: number,
    user1: number,
    user2: number,
    status: boolean,
    applicant: boolean
    state?: OnlineState;
  }

  export interface Block {
    user1: number,
    user2: number
  }