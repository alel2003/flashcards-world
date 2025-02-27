import * as bcrypt from 'bcrypt';

export const BASEUSER = {
  id: 'ckb9u3j4o0001x7yg8xj2j4o7',
  email: 'test@gmail.com',
  password: 'password',
};

export const REGISTERUSER = {
  email: 'test@gmail.com',
  password: 'password',
  repeatPassword: 'password',
};

export const UPDATE_USER = {
  email: 'update_test@gmail.com',
  password: 'password',
};
export const USER_ID = 'ckb9u3j4o0001x7yg8xj2j4o7';

export const USER_RES = { id: USER_ID, email: 'test@gmail.com' };
export const UPDATE_RES = { id: USER_ID, email: 'test@gmail.com' };
export const DELETE_RES = { message: 'Deleted successfully !' };