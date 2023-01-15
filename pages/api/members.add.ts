import { NextApiRequest, NextApiResponse } from 'next';
import MemberController from '@/controller/member.ctrl';
import checkSupportMethod from '@/controller/error/check_support_method';
import handleError from '@/controller/error/handle_error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['POST'];
  try {
    checkSupportMethod(supportMethod, method!);
    await MemberController.add(req, res);
  } catch (err) {
    handleError(err, res);
  }
}
