import {NextFunction, Request, Response} from 'express';
import {IUser} from '../interfaces/user.interface';
import {ApiError} from '../errors/api-error';
import {AccountType} from '../enums/account-type.enum';
import {createSchema, updateSchema} from '../validators/car.validator';


export class CarMiddleware {


    public async checkPremiumAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            if (!user) throw new ApiError('Unauthorized', 401);

             
            const roles = user.roles as unknown as { name: string }[];
            const isAdmin = roles.some(role => role.name === 'admin');


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
                req.query.adStatus = 'ACTIVE';
            }
            next();
        } catch (err) {
            next(err);
        }
    }


    // public async checkProfanity(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const {title, description} = req.body;
    //         const text = `${title ?? ''} ${description ?? ''}`;
    //
    //         const {hasProfanity, words} = containsProfanity(text);
    //
    //         if (hasProfanity) {
    //
    //             req.body.hasProfanity = true;
    //             req.body.profaneWords = words;
    //             req.body.adStatus = AdStatusEnum.PENDING;
    //         } else {
    //
    //             req.body.hasProfanity = false;
    //             req.body.adStatus = AdStatusEnum.ACTIVE;
    //         }
    //         next();
    //     } catch (err) {
    //         next(err);
    //     }
    // }



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
