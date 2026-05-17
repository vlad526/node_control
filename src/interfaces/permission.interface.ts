import { ObjectId } from '../types/common';
import {PermissionEnum} from '../enums/permission.enum';

export interface IPermission{

    _id: ObjectId;
    code: PermissionEnum;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

