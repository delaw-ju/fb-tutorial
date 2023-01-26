import firebase from 'firebase/compat';
import firestore = firebase.firestore;

interface MessageBase {
  id: string;
  message: string;
  reply?: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}

export interface InMessage extends MessageBase {
  replyAt?: string;
  createAt: string;
}

export interface InMessageServer extends MessageBase {
  replyAt?: firestore.Timestamp;
  createAt: firestore.Timestamp;
}
