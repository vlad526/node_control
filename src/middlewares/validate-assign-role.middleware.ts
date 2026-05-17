import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import {ApiError} from '../errors/api-error';

export const validateAssignRoleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, roleName } = req.body;

        const user = await userRepository.findById(userId);
        if (!user)
            throw new ApiError( 'User not found',404);

        const role = await roleRepository.findByName(roleName);
        if (!role)
            throw new ApiError( 'Role not found',404);

        res.locals.userToAssign = user;
        res.locals.roleToAssign = role;

        next();
    } catch (err) {
        next(err);
    }
};
