import {ApiError} from '../errors/api-error';
import {NextFunction, Request, Response} from 'express';
import {userRepository} from '../repositories/user.repository';
import {Types} from 'mongoose';


class UserMiddleware {

    public async isEmailExist(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            const user = await userRepository.findByEmail(email);
            if (user) {
                throw new ApiError(`User with email ${email} already exists`, 409);
            }

            next();
        } catch (e) {
            next(e);
        }
    }

    public async checkUserExists(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId || req.body.userId || req.user?._id;

            if (!userId) {
                throw new ApiError('User ID is required', 400);
            }

            const objectId = new Types.ObjectId(userId);
            const user = await userRepository.findById(objectId);

            if (!user) {
                throw new ApiError('User not found', 404);
            }

            res.locals.foundUser = user;
            next();
        } catch (e) {
            next(e);
        }
    }

}

export const userMiddleware = new UserMiddleware();