import {
  Request ,
  Response ,
} from 'express';

import { jest } from '@jest/globals';

import { ACCESSTOKEN } from '../constants/auth';
import { USER_ID } from '../constants/user';

export const mockCookieResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as Partial<Response> as Response; 
  
  export const mockRequest: jest.Mocked<Request> = {
    user: { sub: USER_ID },
    cookies: { accessToken: ACCESSTOKEN }
  } as any;
  

export const mockJwtGuard = {
  canActivate: jest.fn((context) => true),
};