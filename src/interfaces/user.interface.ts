import {AccountType} from '../enums/account-type.enum';

import {IRole} from './role.interface';
import {OrderEnum} from '../enums/order.enum';
import {UserListOrderByEnum} from '../enums/user-list-order-by.enum';
import {ObjectId} from '../types/common';



export  interface IUser {
    _id: ObjectId;
    name: string;
    age: number;
    email: string;
    password: string;
    roles: ObjectId[] | IRole[];
    permissions?: string[];
    organizationId?: ObjectId | null;
    accountType: AccountType;
    isVerified:boolean;
    isDeleted:boolean;
    phone?:string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ISignIn = Pick<IUser, 'email' | 'password'>;


export interface IUserListQuery {
    limit?: number;
    page?: number;
    search?: string;
    order?: OrderEnum;
    orderBy?: UserListOrderByEnum;
}

export type IUserResponse = Pick<
    IUser,
    | 'name'
    | 'email'
    | 'accountType'
    | 'avatar'
    | 'isDeleted'
    | 'isVerified'
> & {
    _id: string;
    roles: string[];
};


export interface IUserListResponse {
    data: IUserResponse[];
    total: number;
    limit: number;
    page: number;
    search?: string;
    order?: OrderEnum;
    orderBy?: UserListOrderByEnum;
}




