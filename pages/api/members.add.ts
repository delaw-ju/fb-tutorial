// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import FirebaseAdmin from '@/models/firebase_admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;
  if (!uid) return res.status(400).json({ result: false, message: 'uid 누락' });
  if (!email) return res.status(400).json({ result: false, message: 'email 누락' });

  const screenName = email.replace(/@*$/g);
  try {
    const addResult = await FirebaseAdmin.getInstance().Firebase.runTransaction(async (transaction) => {
      const memberRef = await FirebaseAdmin.getInstance().Firebase.collection('member').doc(uid);
      const screenNameRef = await FirebaseAdmin.getInstance().Firebase.collection('screen_name').doc(screenName);
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

    if (!addResult) res.status(200).json({ result: true, id: uid });

    return res.status(200).json({ result: true, id: uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: '서버오류' });
  }
}
