export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
}

export interface IMessage {
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image';
}