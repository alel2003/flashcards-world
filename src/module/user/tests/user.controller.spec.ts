import { Test, TestingModule } from '@nestjs/testing';

import { JwtGuard } from '@guards/jwt.guard';

import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';

import { BASEUSER, DELETE_RES, UPDATE_RES } from 'src/common/tests/constants/user';

import { mockCookieResponse, mockJwtGuard, mockRequest } from 'src/common/tests/utils';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;
  
    const mockUserService = {
      update: jest.fn().mockResolvedValue(UPDATE_RES),
      remove: jest.fn().mockResolvedValue(DELETE_RES),
    };
  
    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [{ provide: UserService, useValue: mockUserService }],
      })
        .overrideGuard(JwtGuard)
        .useValue(mockJwtGuard)
        .compile();
  
        userController = moduleRef.get<UserController>(UserController);
        userService = moduleRef.get<UserService>(UserService);
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    describe('update', () => {
      it('should update a user', async () => {
        const result = await userController.update(mockRequest.user.sub, BASEUSER);
      
        expect(result).toEqual(UPDATE_RES);
        expect(userService.update).toHaveBeenCalledWith(
          mockRequest.user.sub,
          BASEUSER,
        );
      });
    });
  
    describe('remove', () => {
      it('should delete a user', async () => {
        const result = await userController.remove(
          mockRequest.user.sub,
          mockCookieResponse,
        );

        expect(result).toEqual(DELETE_RES);
        expect(
          userService.remove,
        ).toHaveBeenCalledWith(mockRequest.user.sub, mockCookieResponse);
      });
    });
});