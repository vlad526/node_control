import { Schema, model } from 'mongoose';
import {IBrand} from '../interfaces/brand.interface';


const BrandSchema = new Schema<IBrand>({
    name: { type: String, required: true, unique: true },
    models: [{ type: String }]
}, {
    timestamps: true,
});

export const Brand = model<IBrand>('Brand', BrandSchema);
