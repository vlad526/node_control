import { ObjectId } from '../types/common';
import {CurrencyEnum} from '../enums/currency.enum';
import {AdStatusEnum} from '../enums/ad-status.enum';

export interface IAd {
    _id: ObjectId;
    userId: ObjectId;
    title: string;
    description: string;
    price: number;
    currency: CurrencyEnum;
    status: AdStatusEnum;
    exchangeRate: number;
    priceInUAH: number;
    make: string;
    model: string;
    year: number;
    mileage: number;
    images: string[];
    isPremium: boolean;
    views: number;
    isProfanityChecked: boolean;
    isPublished: boolean;
    profanityCheckAttempts: number

    createdAt: Date;
    updatedAt: Date;
}

