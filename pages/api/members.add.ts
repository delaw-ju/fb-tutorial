// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import FirebaseAdmin from '@/models/firebase_admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;
  if (!uid) return res.status(400).json({ result: false, message: 'uid 누락' });

  try {
    const addResult = await FirebaseAdmin.getInstance()
      .Firebase.collection('members')
      .doc(uid)
      .set({
        uid,
        email: email ?? '',
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      });

    return res.status(200).json({ result: true, id: addResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: '서버오류' });
  }
}
