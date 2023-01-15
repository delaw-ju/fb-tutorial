import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/models/member/member.model';
import BadRequestError from '@/controller/error/bad_request_error';
import handleError from '@/controller/error/handle_error';

async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;
  if (!uid) throw new BadRequestError('uid 누락');
  if (!email) throw new BadRequestError('email 누락');
  try {
    const addResult = await MemberModel.add({ uid, email, displayName, photoURL });

    if (addResult.result) return res.status(200).json(addResult);
    return res.status(500).json(addResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: '서버오류' });
  }
}

async function findByScreenName(req: NextApiRequest, res: NextApiResponse) {
  const { screenName } = req.query;
  try {
    if (!screenName) throw new BadRequestError('screenName 누락');
    const extractScreenName = Array.isArray(screenName) ? screenName[0] : screenName;
    const userInfo = await MemberModel.findByScreenName(extractScreenName);
    if (!userInfo) return res.status(404).end();

    res.status(200).send(userInfo);
  } catch (err) {
    handleError(err, res);
  }
}

const MemberController = {
  add,
  findByScreenName,
};

export default MemberController;
