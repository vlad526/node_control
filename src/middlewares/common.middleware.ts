import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { ApiError } from '../errors/api-error';


class CommonMiddleware {


    public isBodyValid(validator: ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {

                req.body = await validator.validateAsync(req.body);
                next();
            } catch (e) {
                next(new ApiError(e.details[0].message, 400));
                // return res.status(400).json({ message: e.details?.[0]?.message || e.message });
            }
        };
    }


}

export const commonMiddleware = new CommonMiddleware();