import {NextFunction, Request, Response} from 'express';
import {IUser} from '../interfaces/user.interface';
import {ApiError} from '../errors/api-error';
import {AccountType} from '../enums/account-type.enum';
import {createSchema, updateSchema} from '../validators/car.validator';
import {AdStatusEnum} from "../enums/ad-status.enum";
import {Role} from '../models/role.model';

export class CarMiddleware {

    public async checkPremiumAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            if (!user) throw new ApiError('Unauthorized', 401);


            const userRoles = await Role.find({ _id: { $in: user.roles } });
            const isAdmin = userRoles.some(role => role.name === 'admin');

            if (user.accountType !== AccountType.PREMIUM && !isAdmin) {
                throw new ApiError('Access denied: Premium account required', 403);
            }
            next();
        } catch (err) {
            next(err);
        }
    }

    public async filterActiveAds(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            if (!user) throw new ApiError('Unauthorized', 401);
            if (user.accountType !== AccountType.PREMIUM) {
                req.query.adStatus = AdStatusEnum.ACTIVE;
            }
            next();
        } catch (err) {
            next(err);
        }
    }

    public async validateBody(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = req.method === 'POST' ? createSchema : updateSchema;
            const { error } = schema.validate(req.body);
            if (error) {
                return next(new ApiError(error.details[0].message, 400));
            }
            next();
        } catch (err) {
            next(err);
        }
    }
}

export const carMiddleware = new CarMiddleware();