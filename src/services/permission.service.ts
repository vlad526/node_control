import {Types} from 'mongoose';
import {userRepository} from '../repositories/user.repository';
import {IPermission} from '../interfaces/permission.interface';
import {IRole} from '../interfaces/role.interface';

export const hasPermission = async (
    userId: string,
    permissionCode: string,
    orgId?: string
): Promise<boolean> => {
    try {
        const objectId = new Types.ObjectId(userId);
        const user = await userRepository.findByIdWithRoles(objectId);
        if (!user) return false;

        const filteredRoles = (user.roles || []) as Array<IRole & { permissions: IPermission[] }>;
        const rolesToCheck = filteredRoles.filter(role =>
            !orgId || role.organizationId?.toString() === orgId
        );

        for (const role of rolesToCheck) {
            const permissions = Array.isArray(role.permissions) ? role.permissions : [];
            for (const permission of permissions) {
                if (permission?.code === permissionCode) return true;
            }
        }

        console.log('User roles and permissions:', rolesToCheck.map(r => ({
            name: r.name,
            permissions: (r.permissions || []).map(p => p?.code)
        })));

        return false;
    } catch (err) {
        console.error('hasPermission error:', err);
        return false;
    }
};

