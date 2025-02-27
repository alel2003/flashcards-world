import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';

import { REFRESH_TOKEN_RESULT, SIGN_IN_RESULT, SIGN_UP_RESULT, STRATEGY_LOCAL, STRATEGY_REFRESH } from 'src/common/tests/constants/auth';

import { BASEUSER, REGISTERUSER } from 'src/common/tests/constants/user';

import { mockCookieResponse, mockRequest } from 'src/common/tests/utils';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
  
    const mockAuthService = {
      signUp: jest.fn().mockResolvedValue(SIGN_UP_RESULT),
      signIn: jest.fn().mockResolvedValue(SIGN_IN_RESULT),
      refreshToken: jest.fn().mockResolvedValue(REFRESH_TOKEN_RESULT)
    };

    const mockLocalAuthGuard = {
      canActivate: jest.fn().mockImplementation((context) => true),
    }

    const mockJwtRefreshGuard = {
      canActivate: jest.fn().mockImplementation((context) => true),
    };
  
    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: mockAuthService }],
      })

      .overrideGuard(AuthGuard(STRATEGY_LOCAL))
      .useValue(mockLocalAuthGuard) 
      .overrideGuard(AuthGuard(STRATEGY_REFRESH))
      .useValue(mockJwtRefreshGuard) 
      .compile();
  
      authController = moduleRef.get<AuthController>(AuthController);
      authService = moduleRef.get<AuthService>(AuthService);
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    describe('sign-up', () => {
      it('should return a success message on sign-up', async () => {
        const result = await authController.register(
          REGISTERUSER,
          mockCookieResponse,
        );
        
        expect(result).toEqual(SIGN_UP_RESULT);
        expect(
          authService.signUp,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('sign-in', () => {
      it('should return a success message on sign-in', async () => {
        const result = await authController.login(BASEUSER, mockCookieResponse);
      
        expect(result).toEqual(SIGN_IN_RESULT);
        expect(
          authService.signIn,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('refreshToken', () => {
      it('should return a success message on refreshToken', async () => {
        const result = await authController.refresh(
          mockRequest.user.sub,
          mockCookieResponse,
        );

        expect(result).toEqual(REFRESH_TOKEN_RESULT);
        expect(
          authService.refreshToken).toHaveBeenCalledTimes(1);
      });
    });
});