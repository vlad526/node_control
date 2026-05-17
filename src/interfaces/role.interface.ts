import {IPermission} from './permission.interface';
import { ObjectId } from '../types/common';
import {RoleEnum} from '../enums/role.enum';


export interface IRole {

    _id: ObjectId;
    name: RoleEnum;
    organizationId?: ObjectId;
    description?: string;
    permissions: ObjectId[] | IPermission[];
    createdAt?: Date;
    updatedAt?: Date;
}
