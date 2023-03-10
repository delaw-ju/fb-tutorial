import { firestore } from 'firebase-admin';
import FirebaseAdmin from '@/models/firebase_admin';
import memberModel from '@/models/member/member.model';
import CustomServerError from '@/controller/error/custom_server_error';
import { InMessage, InMessageServer } from '@/models/message/in_message';
import { InAuthUser } from '@/models/in_auth_user';

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

    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;

    const newMessageRef = memberRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
      messageNo: number;
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
      messageNo: messageCount + 1,
    };

    if (author) newMessageBody.author = author;

    await transaction.set(newMessageRef, newMessageBody);
    await transaction.update(memberRef, { messageCount: messageCount + 1 });
  });
};

const list = async ({ uid }: { uid: string }) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    const messageCollection = await memberRef.collection(MESSAGE_COL).orderBy('createAt', 'desc');
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

const listWithPage = async ({ uid, page = 1, size = 10 }: { uid: string; page?: number; size: number }) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });

    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;

    const totalElements = messageCount;
    const remains = totalElements % size;
    const totalPages = (totalElements - remains) / size + (remains > 0 ? 1 : 0);
    const startAt = totalElements - (page - 1) * size;
    if (startAt < 0) {
      return {
        totalElements,
        totalPages: 0,
        page,
        size,
        contents: [],
      };
    }

    const messageCollection = await memberRef
      .collection(MESSAGE_COL)
      .orderBy('messageNo', 'desc')
      .startAt(startAt)
      .limit(size);
    const messageCollectionDoc = await transaction.get(messageCollection);
    const contents = messageCollectionDoc.docs.map((res) => {
      const docData = res.data() as Omit<InMessageServer, 'id'>;
      return {
        ...docData,
        id: res.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
    });
    return {
      totalElements,
      totalPages,
      page,
      size,
      contents,
    };
  });
  return listData;
};

const get = async ({ uid, messageId }: { uid: string; messageId: string }) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);
  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    const messageDoc = await transaction.get(messageRef);
    if (!messageDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메세지' });

    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data as InMessage;
};

const postReply = async ({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) => {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    const messageDoc = await transaction.get(messageRef);
    if (!messageDoc.exists) throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메세지' });

    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply) throw new CustomServerError({ statusCode: 400, message: '이미 댓글이 작성되었습니다.' });
    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
};

const MessageModel = {
  post,
  list,
  listWithPage,
  get,
  postReply,
};

export default MessageModel;
