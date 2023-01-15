import { NextApiResponse } from 'next';
import CustomServerError from '@/controller/error/custom_server_error';

const handleError = (err: unknown, res: NextApiResponse) => {
  let unKnownError = err;
  if (!(err instanceof CustomServerError)) {
    unKnownError = new CustomServerError({ statusCode: 499, message: 'unknown error' });
  }
  const customError = unKnownError as CustomServerError;
  res
    .status(customError.statusCode)
    .setHeader('location', customError.location ?? '')
    .send(customError.serializeErrors());
};

export default handleError;
