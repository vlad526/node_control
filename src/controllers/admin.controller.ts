import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import {ApiError} from "../errors/api-error";

class AdminController {

    public async toggleBanUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.foundUser;
            const { isBanned } = req.body;

            if (typeof isBanned !== 'boolean') {
                throw new ApiError('You must provide "isBanned" field as a boolean (true or false WITHOUT quotes)', 400);
            }

            await userService.toggleBanUser(user._id, isBanned);

            res.status(200).json({
                message: `User has been successfully ${isBanned ? 'banned' : 'unbanned'}`,
                isBanned
            });
        } catch (e) {
            next(e);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = req.query || {};
            const users = await userService.getList(filters);
            res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            await userService.delete(userId);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

export const adminController = new AdminController();
