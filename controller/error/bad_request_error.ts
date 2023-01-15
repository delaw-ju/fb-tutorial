import CustomServerError from '@/controller/error/custom_server_error';

export default class BadRequestError extends CustomServerError {
  constructor(message: string) {
    super({ statusCode: 400, message });
  }
}
