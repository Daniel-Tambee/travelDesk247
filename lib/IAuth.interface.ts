import { Logger } from '@nestjs/common';
import { Agent, CorporateUser, User } from '@prisma/client';
import { DbService } from 'src/db/db.service';

export interface IAuth {
  db: DbService;
  logger: Logger;
  login(username: string, password: string): Promise<string>;
  logout(token: string): Promise<void>;
  refreshToken(token: string): Promise<string>;
  validateToken(token: string): Promise<boolean>;
  getUserInfo(token: string): Promise<User | null | CorporateUser | Agent>;
  register(userDetails: any): Promise<string>;
  changePassword(
    token: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void>;
  resetPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  verifyPasswordReset(token: string, newPassword: string): Promise<void>;
}
