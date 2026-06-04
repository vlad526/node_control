import { Schema, model } from 'mongoose';

export interface ICarModel {
    _id?: string;
    name: string;
    brandId: Schema.Types.ObjectId | string;
}

const CarModelSchema = new Schema<ICarModel>({
    name: { type: String, required: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true }
}, {
    timestamps: true,
});

export const CarModel = model<ICarModel>('CarModel', CarModelSchema);