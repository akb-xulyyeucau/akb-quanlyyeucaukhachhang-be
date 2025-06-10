import { Document } from 'mongoose';
export interface IUser {
  email: string;
  password: string;
  alias: string;
  role?: 'admin' | 'pm' | 'guest'; 
  isActive?: boolean;
}

export interface ICreateUser {
  email: string;
  password: string;
  alias: string;
  role?: 'admin' | 'pm' | 'guest';
}

export interface IUserDocument extends IUser, Document {
  isModified(arg0: string): boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}