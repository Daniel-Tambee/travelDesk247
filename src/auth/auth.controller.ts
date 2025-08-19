import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { AuthService } from './auth.service';
import { User, CorporateUser, Agent } from '@prisma/client';

// DTOs for API requests
class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class RegisterDto {
  // Assuming a generic user details object for registration
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

class ResetPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

class VerifyPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: String })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<string> {
    try {
      const token = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );
      if (!token) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return token;
    } catch (error) {
      this.authService.logger.error('Failed to log in', error);
      throw new InternalServerErrorException('Failed to log in');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out a user' })
  @ApiBody({
    type: String,
    description: 'The authentication token to invalidate',
  })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  async logout(@Body() body: { token: string }): Promise<void> {
    try {
      await this.authService.logout(body.token);
    } catch (error) {
      this.authService.logger.error('Failed to log out', error);
      throw new InternalServerErrorException('Failed to log out');
    }
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh an authentication token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async refreshToken(@Body() body: { token: string }): Promise<string> {
    try {
      const newToken = await this.authService.refreshToken(body.token);
      if (!newToken) {
        throw new UnauthorizedException('Invalid token');
      }
      return newToken;
    } catch (error) {
      this.authService.logger.error('Failed to refresh token', error);
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid details or user already exists',
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<string> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.authService.logger.error('Registration failed', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Put('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or password',
  })
  async changePassword(
    @Body() body: { token: string; oldPassword: string; newPassword: string },
  ): Promise<void> {
    try {
      await this.authService.changePassword(
        body.token,
        body.oldPassword,
        body.newPassword,
      );
    } catch (error) {
      this.authService.logger.error('Failed to change password', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async requestPasswordReset(
    @Body(ValidationPipe) resetRequestDto: ResetPasswordRequestDto,
  ): Promise<void> {
    try {
      await this.authService.requestPasswordReset(resetRequestDto.email);
    } catch (error) {
      this.authService.logger.error('Failed to request password reset', error);
      throw new InternalServerErrorException(
        'Failed to request password reset',
      );
    }
  }

  @Post('verify-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset token and set new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid token or link',
  })
  async verifyPasswordReset(
    @Body(ValidationPipe) verifyResetDto: VerifyPasswordResetDto,
  ): Promise<void> {
    try {
      await this.authService.verifyPasswordReset(
        verifyResetDto.token,
        verifyResetDto.newPassword,
      );
    } catch (error) {
      this.authService.logger.error('Failed to verify password reset', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify password reset');
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 204, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid token' })
  async verifyEmail(
    @Body(ValidationPipe) verifyEmailDto: VerifyEmailDto,
  ): Promise<void> {
    try {
      await this.authService.verifyEmail(verifyEmailDto.token);
    } catch (error) {
      this.authService.logger.error('Failed to verify email', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify email');
    }
  }
}
