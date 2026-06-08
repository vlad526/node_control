import {NextFunction, Request, Response} from 'express';
import {carService} from '../services/car.service';
import {IUser} from '../interfaces/user.interface';
import {GetCarsQuery} from '../interfaces/car.interface';
import {ApiError} from '../errors/api-error';

class CarController {

    public async createCar(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            const car = await carService.createCar(user, req.body);

            res.status(201).json(car);
        } catch (e) {
            next(e);
        }
    }

    public async editCar(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            const { id } = req.params;
            const updatedCar = await carService.editCar(id, req.body, user);
            res.status(200).json(updatedCar);
        } catch (e) {
            next(e);
        }
    }

    public async getCarStats(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser;
            const { id } = req.params;
            const stats = await carService.getCarStats(id, user);

            if (!stats) {
                throw new ApiError('Insufficient permissions to view statistics for this vehicle, or vehicle not found', 403);
            }

            res.status(200).json(stats);
        } catch (err) {
            next(err);
        }
    }

    public async updatePrices(req: Request, res: Response, next: NextFunction) {
        try {
            await carService.updatePrices();
            res.status(200).json({ message: 'Currency exchange rates and vehicle prices have been successfully synchronized' });
        } catch (err) {
            next(err);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const car = await carService.getCarById(id);
            res.status(200).json(car);
        } catch (err) {
            next(err);
        }
    }

    public async getAll(req: Request<unknown, unknown, unknown, GetCarsQuery>, res: Response, next: NextFunction) {
        try {
            const user = req.user as IUser | undefined;
            const paginatedResult = await carService.getAllCars(req.query, user);
            res.status(200).json(paginatedResult);
        } catch (err) {
            next(err);
        }
    }

    public async verifyCar(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params;
            const updatedCar = await carService.verifyCar(carId);
            res.status(200).json({
                message: 'Advertisement has been successfully verified and activated',
                car: updatedCar
            });
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params;
            await carService.deleteCar(carId);
            res.status(200).json({ message: 'Car advertisement has been permanently deleted' });
        } catch (err) {
            next(err);
        }
    }
}

export const carController = new CarController();