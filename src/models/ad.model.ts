import {model, Schema} from 'mongoose';
import {IAd} from '../interfaces/ad.interface';
import {CurrencyEnum} from '../enums/currency.enum';


const AdSchema = new Schema(
    {
    title: {type: String, required: true, minlength: 5, maxlength: 100,},
    description: {type: String, required: true, minlength: 20, maxlength: 1000,},
        price: {type:Number, required: true},
        currency: { type: String, enum: Object.values(CurrencyEnum), required: true },
        exchangeRate: { type: Number, required: true },
        priceInUAH: { type: Number, required: true },
        make: {type:String, required:true},
        model: { type: String, required: true },
        year: {type:Number, required:true},
        mileage: {type:Number, required:true},
        images: { type: [String], required: true, default: []},
        isPremium:{type: Boolean, default: false},
        views: { type: Number, default: 0},
        isProfanityChecked: {type: Boolean, default: false},
        isPublished: {type: Boolean, default: false},
        profanityCheckAttempts: { type: Number, default: 0 }


    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Ad = model<IAd>('Ad', AdSchema);
