import { IRole } from '../interfaces/role.interface';
import { RoleEnum } from '../enums/role.enum';
import { Types } from 'mongoose';
import {Role} from '../models/role.model';

export async function mapRolesToEnum(roles: Types.ObjectId[] | IRole[] | string[]): Promise<RoleEnum[]> {
    if (roles.length === 0) return [];

    if (typeof roles[0] === 'object' && 'name' in roles[0]) {

        return (roles as IRole[]).map(role => role.name as RoleEnum);
    } else if (typeof roles[0] === 'string') {

        return (roles as string[]).map(r => r as RoleEnum);
    } else {

        const roleIds = roles as Types.ObjectId[];
        const rolesFromDB: IRole[] = await Role.find({ _id: { $in: roleIds } });
        return rolesFromDB.map(role => role.name as RoleEnum);
    }
}