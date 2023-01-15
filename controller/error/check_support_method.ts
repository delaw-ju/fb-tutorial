import BadRequestError from '@/controller/error/bad_request_error';

export default function checkSupportMethod(supportMethod: string[], method: string) {
  if (!supportMethod.includes(method)) throw new BadRequestError('지원하지 않는 메소드입니다.');
}
