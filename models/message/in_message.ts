export interface InMessage {
  id: string;
  message: string;
  createAt: string;
  reply?: string;
  replyAt?: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}
