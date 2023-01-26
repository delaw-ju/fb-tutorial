import { firestore } from 'firebase-admin';
import FirebaseAdmin from '@/models/firebase_admin';
import memberModel from '@/models/member/member.model';
import CustomServerError from '@/controller/error/custom_server_error';
import { InMessage, InMessageServer } from '@/models/message/in_message';

const MESSAGE_COL = 'message';

const { Firestore } = FirebaseAdmin.getInstance();
const { MEMBER_COL } = memberModel;
const post = async ({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });

    const newMessageRef = memberRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };

    if (author) newMessageBody.author = author;

    await transaction.set(newMessageRef, newMessageBody);
  });
};

const list = async ({ uid }: { uid: string }) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    const messageCollection = await memberRef.collection(MESSAGE_COL);
    const messageCollectionDoc = await transaction.get(messageCollection);
    const data = messageCollectionDoc.docs.map((res) => {
      const docData = res.data() as Omit<InMessageServer, 'id'>;
      return {
        ...docData,
        id: res.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
    });
    return data;
  });
  return listData;
};

const MessageModel = {
  post,
  list,
};

export default MessageModel;
