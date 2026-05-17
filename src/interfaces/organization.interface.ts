import { ObjectId } from '../types/common';
import {RoleEnum} from '../enums/role.enum';
import {RoleScope} from '../enums/role-scope.enum';

export interface IOrganization {
    _id: ObjectId;
    name: string;
    type: RoleScope[];
    roles: ObjectId[] | RoleEnum[];
    users: ObjectId[];
}