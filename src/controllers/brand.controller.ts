import { Request, Response, NextFunction } from 'express';
import { Brand } from '../models/brand.model';
import {emailService} from '../services/email.service';
import {IUser} from '../interfaces/user.interface';
import {CarModel} from "../models/car-model.model";

class BrandController {
    public async getAllBrands(req: Request, res: Response, next: NextFunction) {
        try {
            const brands = await Brand.aggregate([
                {
                    $lookup: {
                        from: 'carmodels',
                        localField: '_id',
                        foreignField: 'brandId',
                        as: 'models'
                    }
                },
                { $sort: { name: 1 } }
            ]);
            res.status(200).json(brands);
        } catch (err) {
            next(err);
        }
    }

    public async suggestBrand(req: Request, res: Response, next: NextFunction) {
        try {
            const {name} = req.body;
            const user = req.user as IUser;
            if (!name) return res.status(400).json({message: 'Brand name is required'});
            if (!user) return res.status(401).json({message: 'Unauthorized'});


            await emailService.sendBrandSuggestionEmail(name, {name: user.name, email: user.email});

            res.status(200).json({message: `Brand "${name}" suggestion sent to admin`});
        } catch (err) {
            next(err);
        }
    }

    public async suggestModel(req: Request, res: Response, next: NextFunction) {
        try {
            const { brandName, modelName } = req.body;
            const user = req.user as IUser;

            if (!brandName || !modelName) {
                return res.status(400).json({ message: 'Brand name and model name are required' });
            }
            if (!user) return res.status(401).json({ message: 'Unauthorized' });


            const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
            if (!brand) {
                return res.status(404).json({ message: `Brand '${brandName}' not found in the database` });
            }


            const existingModel = await CarModel.findOne({
                brandId: brand._id,
                name: { $regex: new RegExp(`^${modelName}$`, 'i') }
            });

            if (existingModel) {
                return res.status(400).json({ message: `Model '${existingModel.name}' already exists for brand '${brand.name}'` });
            }


            await emailService.sendModelSuggestionEmail(
                brand.name,
                modelName,
                { name: user.name, email: user.email }
            );

            res.status(200).json({ message: `Model "${modelName}" for brand "${brand.name}" suggestion sent to admin` });
        } catch (err) {
            next(err);
        }
    }
}
export const brandController = new BrandController();
