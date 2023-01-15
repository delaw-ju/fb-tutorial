import { InAuthUser } from '@/models/in_auth_user';
import FirebaseAdmin from '@/models/firebase_admin';

const MEMBER_COL = 'member';
const SCREEN_NAME_COL = 'screen_name';

type AddResult = { result: true; id: string } | { result: false; message: string };

async function add({ uid, email, displayName, photoURL }: InAuthUser): Promise<AddResult> {
  try {
    const screenName = (email as string).replace('@gmail.com', '');
    await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      const memberRef = await FirebaseAdmin.getInstance().Firestore.collection('member').doc(uid);
      const screenNameRef = await FirebaseAdmin.getInstance().Firestore.collection('screen_name').doc(screenName);
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) return false;
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };
      await transaction.set(memberRef, addData);
      await transaction.set(screenNameRef, addData);
      return true;
    });

    return { result: true, id: uid };
  } catch (err) {
    return { result: false, message: '서버 오류 발생' };
  }
}

async function findByScreenName(screenName: string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCREEN_NAME_COL).doc(screenName);

  const memberDoc = await memberRef.get();
  if (!memberDoc.exists) return null;
  return memberDoc.data() as InAuthUser;
}

const MemberModel = {
  MEMBER_COL,
  SCREEN_NAME_COL,
  add,
  findByScreenName,
};

export default MemberModel;
