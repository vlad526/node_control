import {IAd} from '../interfaces/ad.interface';
import {HydratedDocument} from 'mongoose';
import {Ad} from '../models/ad.model';


export class AdRepository {
    public async create(dto: Partial<IAd>): Promise<HydratedDocument<IAd>> {
        return Ad.create(dto);
    }

    public async findById(id: string ): Promise<HydratedDocument<IAd>> {
        return Ad.findById(id).populate('seller');
    }

     // async updateById(adId: string, updateData:Partial<IAd>): Promise<HydratedDocument<IAd> | null> {
     //     return Ad.findByIdAndUpdate(adId, updateData, { new: true });
     // }


    public async findAll(): Promise<HydratedDocument<IAd>[]> {
        return Ad.find().populate('seller');
    }

    public async delete(id: string): Promise<void> {
        await Ad.findByIdAndDelete(id);
    }

   public  async findActiveAds(): Promise<IAd[]> {
        return Ad.find({ isActive: true });
    }

    public async updateAdPrice(adId: string, newPriceUAH: number, rateUsed: number): Promise<void> {
        await Ad.findByIdAndUpdate(adId, {
            priceInUAH: newPriceUAH,
            lastRateUsed: rateUsed,
            updatedAt: new Date()
        });
    }
};
export const adRepository = new AdRepository();


