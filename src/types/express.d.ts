import { UserPayload } from '../users/interfaces/user-data.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
