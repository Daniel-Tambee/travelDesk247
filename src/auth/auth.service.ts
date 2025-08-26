import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { User, OtpType, Agent, CorporateUser } from '@prisma/client';
import { IAuth } from 'lib/IAuth.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

/**
 * An enum to define the different types of users in the system.
 */
export enum UserType {
  STANDARD = 'STANDARD',
  AGENT = 'AGENT',
  CORPORATE = 'CORPORATE',
}

@Injectable()
export class AuthService implements IAuth {
  // It's a good practice to inject the database service and logger
  constructor(
    public db: DbService,
    public logger: Logger,
  ) {}

  /**
   * Generates a JWT token for a given user ID.
   * This is a helper method to keep the code clean.
   * @param userId The ID of the user.
   * @returns The generated JWT token string.
   */
  private async generateToken(userId: string): Promise<string> {
    // In a production app, you would use a secret key from environment variables.
    const secret = 'YOUR_SECRET_KEY';
    const expiresIn = '1h'; // Token expiration time

    const payload = { userId };
    const token = jwt.sign(payload, secret, { expiresIn });
    const session = await this.db.session.create({
      data: {
        token: token,
        // userId: userId,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      },
    });

    return token;
  }

  /**
   * Retrieves user information from a valid token.
   * @param token The user's token.
   * @returns A promise that resolves to the user, or their specific profile if one exists.
   */
  async getUserInfo(
    token: string,
  ): Promise<User | Agent | CorporateUser | null> {
    try {
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as {
        userId: string;
      };

      const user = await this.db.user.findUnique({
        where: { id: decoded.userId },
        include: {
          agentProfile: true,
          corporateProfile: true,
        },
      });

      if (!user) {
        this.logger.warn('User not found for token', { token });
        return null;
      }

      // Use a switch statement to return the correct user profile based on the loaded data.
      switch (true) {
        case !!user.corporateProfile:
          return user.corporateProfile;
        case !!user.agentProfile:
          return user.agentProfile;
        default:
          return user;
      }
    } catch (error) {
      this.logger.error('Failed to get user info from token', { error, token });
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Registers a new user with their details.
   * Hashes the password, creates the user, and generates an OTP for email verification.
   * @param userDetails The new user's details.
   * @returns A promise that resolves to the new user's token.
   */
  async register(userDetails: any): Promise<string> {
    try {
      this.logger.log('Attempting to register new user', {
        email: userDetails.email,
      });

      // Wrap everything in a database transaction
      return await this.db.$transaction(async (prisma) => {
        // Hash the password for security. The salt rounds (10) can be adjusted.
        const hashedPassword = await bcrypt.hash(userDetails.password, 10);
        delete userDetails['username'];
        // Create the new user in the database
        const newUser = await prisma.user.create({
          data: {
            ...userDetails,
            password: hashedPassword,
          },
        });

        // Based on the userType, create a specific profile for the user
        switch (userDetails.userType) {
          case UserType.AGENT:
            await prisma.agent.create({
              data: {
                ...userDetails,
                user: {
                  connect: {
                    id: newUser.id,
                  },
                },
              },
            });
            break;
          case UserType.CORPORATE:
            await prisma.corporateUser.create({
              data: {
                ...userDetails,
                user: {
                  connect: {
                    id: newUser.id,
                  },
                },
              },
            });
            break;
          case UserType.STANDARD:
          default:
            // No additional profile needed for standard users
            break;
        }

        // Generate an OTP for email verification
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP expires in 15 minutes

        await prisma.otpCode.create({
          data: {
            userId: newUser.id,
            code: otpCode,
            type: OtpType.EMAIL_VERIFICATION,
            expiresAt,
          },
        });

        this.logger.log(
          'User registered successfully. OTP generated for email verification.',
          { userId: newUser.id },
        );

        return this.generateToken(newUser.id);
      });
    } catch (error) {
      this.logger.error('Failed to register user', {
        error,
        email: userDetails.email,
      });
      throw error;
    }
  }

  /**
   * Logs a user in with an email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A promise that resolves to the user's session token.
   */
  async login(email: string, password: string): Promise<string> {
    try {
      this.logger.log('Attempting to log in user', { email });

      // Find the user by their email address
      const user = await this.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.warn('Login failed: User not found', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn('Login failed: Invalid password', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log('User logged in successfully', { userId: user.id });
      return this.generateToken(user.id);
    } catch (error) {
      this.logger.error('Login failed', { error, email });
      throw error;
    }
  }

  /**
   * Logs a user out by invalidating their session token.
   * In a more complex system, this would involve blacklisting the token.
   * For this implementation, we will simply not perform any action as JWTs are stateless.
   * @param token The user's token.
   * @returns A promise that resolves when the logout is complete.
   */
  async logout(token: string): Promise<void> {
    this.logger.log('User attempting to log out', { token });
    // In a JWT-based system, logout is generally handled on the client-side
    // by deleting the token. For server-side invalidation, a token blacklist
    // or a session table is required. The provided schema has a Session model,
    // so we could delete the corresponding session entry.
    try {
      await this.db.session.delete({ where: { token } });
      this.logger.log('User logged out successfully by deleting session.');
    } catch (error) {
      this.logger.warn('Logout failed or token not found', { error, token });
    }
  }

  /**
   * Refreshes a session token.
   * @param token The user's current token.
   * @returns A promise that resolves to a new session token.
   */
  async refreshToken(token: string): Promise<string> {
    try {
      this.logger.log('Attempting to refresh token', { token });
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as {
        userId: string;
      };
      const newSessionToken = this.generateToken(decoded.userId);
      this.logger.log('Token refreshed successfully', {
        userId: decoded.userId,
      });
      return newSessionToken;
    } catch (error) {
      this.logger.error('Failed to refresh token', { error, token });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Validates a session token.
   * @param token The token to validate.
   * @returns A promise that resolves to true if the token is valid, false otherwise.
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, 'YOUR_SECRET_KEY');
      this.logger.debug('Token is valid');
      return true;
    } catch (error) {
      this.logger.debug('Token is invalid', { error });
      return false;
    }
  }

  /**
   * Retrieves user logrmation from a valid token.
   * @param token The user's token.
   * @returns A promise that resolves to the user, or their specific profile if one exists.
   */
  async getUserlog(
    token: string,
  ): Promise<User | Agent | CorporateUser | null> {
    try {
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as {
        userId: string;
      };

      const user = await this.db.user.findUnique({
        where: { id: decoded.userId },
        include: {
          agentProfile: true,
          corporateProfile: true,
        },
      });

      if (!user) {
        this.logger.warn('User not found for token', { token });
        return null;
      }

      // Use a switch statement to return the correct user profile based on the loaded data.
      switch (true) {
        case !!user.corporateProfile:
          return user.corporateProfile;
        case !!user.agentProfile:
          return user.agentProfile;
        default:
          return user;
      }
    } catch (error) {
      this.logger.error('Failed to get user log from token', { error, token });
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Changes a user's password.
   * @param token The user's token.
   * @param oldPassword The current password.
   * @param newPassword The new password.
   * @returns A promise that resolves when the password is changed.
   */
  async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as {
        userId: string;
      };
      const user = await this.db.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        this.logger.warn('Password change failed: Invalid credentials');
        throw new UnauthorizedException('Invalid credentials');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.db.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      });

      this.logger.log('Password changed successfully', { userId: user.id });
    } catch (error) {
      this.logger.error('Failed to change password', { error });
      throw error;
    }
  }

  /**
   * Requests a password reset for a given email.
   * Generates a new OTP code and simulates sending an email.
   * @param email The user's email.
   * @returns A promise that resolves when the request is processed.
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      this.logger.log('Requesting password reset', { email });
      const user = await this.db.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.warn('Password reset requested for non-existent email', {
          email,
        });
        // Return without throwing an error to prevent user enumeration attacks
        return;
      }

      // Generate a new OTP code for password reset
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await this.db.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: OtpType.PASSWORD_RESET,
          expiresAt,
        },
      });

      // TODO: Integrate a real email service here to send the OTP to the user.
      this.logger.log('Password reset OTP generated and sent to user email.', {
        userId: user.id,
      });
    } catch (error) {
      this.logger.error('Failed to request password reset', { error, email });
      throw error;
    }
  }

  /**
   * Verifies an OTP for password reset and sets a new password.
   * @param token The OTP code.
   * @param newPassword The new password.
   * @returns A promise that resolves when the password is reset.
   */
  async verifyPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      this.logger.log('Verifying password reset OTP', { token });

      const otpRecord = await this.db.otpCode.findFirst({
        where: {
          code: token,
          type: OtpType.PASSWORD_RESET,
          expiresAt: { gt: new Date() }, // Check that the OTP is not expired
          verified: false, // Ensure the OTP has not been used
        },
        include: { user: true },
      });

      if (!otpRecord) {
        this.logger.warn('Invalid or expired password reset token');
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Hash the new password and update the user record
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.db.user.update({
        where: { id: otpRecord.userId },
        data: { password: hashedPassword },
      });

      // Mark the OTP as used
      await this.db.otpCode.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      this.logger.log('Password reset successful', {
        userId: otpRecord.userId,
      });
    } catch (error) {
      this.logger.error('Failed to verify password reset', { error });
      throw error;
    }
  }
  async verifyEmail(token: string): Promise<void> {
    try {
      this.logger.log('Verifying email with token', { token });

      const otpRecord = await this.db.otpCode.findFirst({
        where: {
          code: token,
          type: OtpType.EMAIL_VERIFICATION,
          expiresAt: { gt: new Date() },
          verified: false,
        },
        include: { user: true },
      });

      if (!otpRecord) {
        this.logger.warn(
          'Email verification failed: Invalid or expired token',
          { token },
        );
        throw new UnauthorizedException(
          'Invalid or expired verification token',
        );
      }

      // Update the user's isVerified field to true
      await this.db.user.update({
        where: { id: otpRecord.userId },
        data: { isVerified: true },
      });

      // Mark the OTP as used
      await this.db.otpCode.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      this.logger.log('Email verified successfully', {
        userId: otpRecord.userId,
      });
    } catch (error) {
      this.logger.error('Email verification failed', { error, token });
      throw error;
    }
  }
  /**
   * Resets a user's password by initiating a reset flow.
   * This method exists to satisfy the IAuth interface and calls the
   * existing requestPasswordReset method.
   * @param email The user's email.
   * @returns A promise that resolves when the request is processed.
   */
  async resetPassword(email: string): Promise<void> {
    return this.requestPasswordReset(email);
  }
}
