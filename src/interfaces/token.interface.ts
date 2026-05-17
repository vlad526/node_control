import {ObjectId} from '../types/common';
import {RoleEnum} from '../enums/role.enum';


export interface IToken {
    _id?: ObjectId;
    _userId: ObjectId;
    accessToken: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITokenPayload {
    userId: string;
    roles: RoleEnum[];
    email?: string;
    name?: string;

}

export interface ITokenPair {
    accessToken: string;
    refreshToken: string;
}


export interface IUserJwtPayload {
    _id: string;
    roles: string[];
    permissions?: string[];
    name?: string;
    email?: string;
}
