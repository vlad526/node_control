import { model, Schema } from 'mongoose';

const carViewSchema = new Schema({
    carId: { type: Schema.Types.ObjectId, ref: 'cars', required: true },
    date: { type: Date, default: Date.now }
});

carViewSchema.index({ carId: 1, date: 1 });

export const CarView = model('car-views', carViewSchema);