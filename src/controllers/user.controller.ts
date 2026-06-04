import {NextFunction, Request, Response} from 'express';
import {userRepository} from '../repositories/user.repository';
import {Types} from 'mongoose';
import {userService} from "../services/user.service";
import {IUser} from "../interfaces/user.interface";


class UserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userRepository.create(req.body);
            res.status(201).json(user);
        } catch (e) {
            next(e);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userRepository.findAll();
            res.json(users);
        } catch (e) {
            next(e);
        }

    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = new Types.ObjectId(req.params.id);
            const user = await userRepository.findById(userId);
            res.json(user);
        } catch (e) {
            next(e);
        }

    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = new Types.ObjectId(req.params.id);
            const user = await userRepository.update(userId, req.body);
            res.json(user);
        } catch (e) {
            next(e);
        }

    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = new Types.ObjectId(req.params.id);
            await userRepository.delete(userId);
            res.status(204).send();

        } catch (e) {
            next(e);
        }

    }

    public async upgradeToPremium(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;

            const updatedUser = await userService.upgradeToPremium(user._id);

            res.status(200).json({
                message: 'Successfully upgraded to Premium!',
                user: updatedUser
            });
        } catch (e) {
            next(e);
        }
    }
   }

export const userController = new UserController();
