import { roleRepository } from '../repositories/role.repository';

class RoleService {

    public async assignRole(userId: string, roleId: string) {
        return roleRepository.assignRoleToUser(userId, roleId);
    }
}

export const roleService = new RoleService();
