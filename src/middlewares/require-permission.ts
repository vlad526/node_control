import {NextFunction, Request, Response} from 'express';
import {hasPermission} from '../services/permission.service';
import {ApiError} from '../errors/api-error';


export const requirePermissionMiddleware = (permissionCode: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user)
                throw new ApiError( 'Unauthorized',401);

            const allowed = await hasPermission(user._id.toString(), permissionCode);
            if (!allowed)
                throw new ApiError( `No permission: ${permissionCode}`,403);


            next();
        } catch (err) {
            next(err);
        }
    };
};


