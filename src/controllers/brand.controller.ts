import { Request, Response, NextFunction } from 'express';
import { Brand } from '../models/brand.model';
import {emailService} from '../services/email.service';
import {IUser} from '../interfaces/user.interface';

class BrandController {
    public async getAllBrands(req: Request, res: Response, next: NextFunction) {
        try {
            const brands = await Brand.find().sort({name: 1}); // сортування за алфавітом
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
}
export const brandController = new BrandController();
