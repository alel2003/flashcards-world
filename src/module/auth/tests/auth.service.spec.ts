import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../auth.service';

import { UserService } from '@user/user.service';

import { ConfigService } from '@nestjs/config';

import { BASEUSER, REGISTERUSER, USER_ID } from 'src/common/tests/constants/user';

import { ACCESSTOKEN } from 'src/common/tests/constants/auth';

import { mockCookieResponse, mockRequest } from 'src/common/tests/utils';

describe('AuthService (Unit Test)', () => {
    let authService: AuthService;

    const mockRedisClient = {
        set: jest.fn(),  
        del: jest.fn(), 
    };
    
    const mockJwtService = {
        signAsync: jest.fn().mockReturnValue(ACCESSTOKEN), 
    };
      
    const mockUserService = {
        findOneByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: USER_ID, email: REGISTERUSER.email })
    };

    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: JwtService, useValue: mockJwtService },
          { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue(604800) } },
          { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
          { provide: UserService, useValue: mockUserService }
        ],
      }).compile();
  
      authService = moduleRef.get<AuthService>(AuthService);
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should validate user', async () => {
        mockUserService.findOneByEmail.mockResolvedValue(BASEUSER);
      
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      
        const result = await authService.validateUser(BASEUSER.email, BASEUSER.password);
      
        expect(result).toEqual({ id: BASEUSER.id, email: BASEUSER.email });
        expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(BASEUSER.email);
        expect(bcrypt.compare).toHaveBeenCalledWith(BASEUSER.password, BASEUSER.password);
      });
      

    it('should generate JWT token on register', async () => {
        mockUserService.findOneByEmail.mockResolvedValue(null);
        const userWithHashedPassword = {
          ...REGISTERUSER,
          password: await bcrypt.hash(REGISTERUSER.password, 10),
        };
        
        mockUserService.create.mockResolvedValue(userWithHashedPassword);
        
        await authService.signUp(REGISTERUSER, mockCookieResponse);
        
        expect(mockCookieResponse.cookie).toHaveBeenCalled();
        expect(mockJwtService.signAsync).toHaveBeenCalled();
    });
    
    it('should store refresh token in Redis', async () => {
        await authService.refreshToken(mockRequest.user.sub, mockCookieResponse);
    
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          `user:${USER_ID}`,
          expect.any(String),
          'EX',
          604800, 
        );
    });
});  