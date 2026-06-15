import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { ApiError } from '../errors/api-error';
import { IUser } from '../interfaces/user.interface';
import { Role } from '../models/role.model';

export const validateAssignRoleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, roleName } = req.body;
        const requester = req.user as IUser;


        if (roleName === 'admin') {
            throw new ApiError('Forbidden: Cannot assign "admin" role via this endpoint', 403);
        }


        if (roleName === 'manager') {
            if (!requester) {
                throw new ApiError('Unauthorized', 401);
            }

            const requesterRoles = await Role.find({ _id: { $in: requester.roles } });
            const isAdmin = requesterRoles.some(role => role.name === 'admin');

            if (!isAdmin) {
                throw new ApiError('Forbidden: Only administrators can assign the "manager" role', 403);
            }
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        const role = await roleRepository.findByName(roleName);
        if (!role) {
            throw new ApiError('Role not found', 404);
        }

        res.locals.userToAssign = user;
        res.locals.roleToAssign = role;

        next();
    } catch (err) {
        next(err);
    }
};