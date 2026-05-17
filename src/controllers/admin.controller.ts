import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

class AdminController {

    public async toggleBanUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.foundUser;
            const { isBanned } = req.body;
            await userService.toggleBanUser(user._id, isBanned);
            res.status(204).send();
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
