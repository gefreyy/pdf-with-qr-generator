import { Request } from 'express';
import { UserPayload } from 'src/users/interfaces/user-data.interface';

export interface RequestWithUser extends Request {
  user: UserPayload;
}