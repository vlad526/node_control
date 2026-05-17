import {IRole} from '../interfaces/role.interface';
import {Role} from '../models/role.model';
import {HydratedDocument} from 'mongoose';
import {User} from '../models/user.model';
import {ObjectId} from '../types/common';
import {Permission} from '../models/permission.model';
import {PermissionEnum} from '../enums/permission.enum';

class RoleRepository {

    public async create(dto: Partial<IRole>):Promise<HydratedDocument<IRole>> {
        return Role.create(dto);
    }

    public async update(id: string, dto: Partial<IRole>):Promise<HydratedDocument<IRole>> {
        return Role.findByIdAndUpdate(id, dto, { new: true });
    }

    public async delete(id: string):Promise<void> {
        await Role.findByIdAndDelete(id);
    }

    public async upsert(roleName: string, scope: string, permissionCodes: PermissionEnum[]): Promise<IRole> {
        const permissions = await Permission.find({ code: { $in: permissionCodes } });
        const role = await Role.findOneAndUpdate(
            { name: roleName, scope },
            { name: roleName, scope, permissions },
            { upsert: true, new: true }
        );

        return role;
    }

    public async findByName(name: string): Promise<IRole | null> {
        return Role.findOne({ name }).populate('permissions').exec();
    }

    public async findAll(): Promise<IRole[]> {
        return Role.find().populate('permissions').exec();
    }

    public async assignRoleToUser(
        userId: string | ObjectId,
        roleId: string | ObjectId
    ) {
        return User.findByIdAndUpdate(
            userId,
            { $addToSet: { roles: roleId } },
            { new: true }
        ).populate('roles');
    }

}

export const roleRepository = new RoleRepository();
