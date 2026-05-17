import {Car} from '../models/car.model';
import {ICar} from '../interfaces/car.interface';
import mongoose, {FilterQuery, HydratedDocument, Types} from 'mongoose';
import {ObjectId} from '../types/common';
import {AdStatusEnum} from '../enums/ad-status.enum';

export class CarRepository {

    public async create(dto: Partial<ICar>): Promise<HydratedDocument<ICar>> {
        return Car.create(dto);
    }

    public async findById(id: string): Promise<HydratedDocument<ICar> | null> {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
        return Car.findById(id);

    }

    public findQuery(filters: FilterQuery<ICar> = {}) {
        return  Car.find({
            ...filters,
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
        });
    }

    public async countActiveBySeller(sellerId: ObjectId | string): Promise<number> {
        const id = typeof sellerId === 'string' ? new Types.ObjectId(sellerId) : sellerId;
        return Car.countDocuments({
            sellerId: id,
            adStatus: AdStatusEnum.ACTIVE
        });
    }

    public async delete(id: string): Promise<void> {
        if (!id || !Types.ObjectId.isValid(id)) return;
        await Car.findByIdAndUpdate(id, { isDeleted: true });
    }
    public async updateCar(carId: Types.ObjectId, update: object) {
        return Car.findByIdAndUpdate(carId, update, { new: true }).exec();
    }

    public async deleteCar(carId: Types.ObjectId) {
        return Car.findByIdAndDelete(carId).exec();
    }

}

export const carRepository = new CarRepository();

