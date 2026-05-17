import Joi from 'joi';
import {CurrencyEnum} from '../enums/currency.enum';
import {AdStatusEnum} from '../enums/ad-status.enum';


export const createSchema = Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),

    description: Joi.string().allow('', null).max(2000),

    brand: Joi.string().trim().required(),

    model: Joi.alternatives().try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim().min(1))
    ).required(),

    currency: Joi.string()
        .valid(...Object.values(CurrencyEnum))
        .required(),

    price: Joi.number().positive().required(),

    priceUAH: Joi.number().positive().optional(),
    priceUSD: Joi.number().positive().optional(),
    priceEUR: Joi.number().positive().optional(),
    priceSource: Joi.string().optional(),
    priceRate: Joi.number().positive().optional(),

    adStatus: Joi.string()
        .valid(...Object.values(AdStatusEnum))
        .optional(),

    hasProfanity: Joi.boolean().optional(),
    profaneWords: Joi.array().items(Joi.string()).optional(),
    editAttempts: Joi.number().integer().min(0).optional(),

    views: Joi.array()
        .items(Joi.object({ date: Joi.date().required() }))
        .default([]),

    region: Joi.string().trim().required(),

    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
});
export const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (field) =>
    field.optional()
);
