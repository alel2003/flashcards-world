import { Request as ExpressRequest,  Response as ExpressResponse} from 'express';

declare module 'express' {
  export interface Request extends ExpressRequest {
    user: {
      sub: string;
    };
    cookies: {
      accessToken?: string;
    };
  }
  export interface Response extends ExpressResponse {
    cookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
};