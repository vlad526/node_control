import Joi from 'joi';
import {RoleEnum} from '../enums/role.enum';


export const userIdSchema = Joi.object({
    userId: Joi.string().hex().length(24).required()
});

// export const userBodySchema = Joi.object({
//     name: Joi.string().min(3).required(),
//     email: Joi.string().email().required(),
//     password: Joi.string()
//         .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d).{8,}$'))
//         .required()
//         .messages({
//             'string.pattern.base': 'Password must be at least 8 characters long and contain both letters and numbers',
//         }),
//     age: Joi.number().min(0).required(),
//     phone: Joi.string().pattern(/^\+?\d{7,15}$/).optional(),
//     roles: Joi.array().items(Joi.string().valid(...Object.values(RoleEnum))).optional(),
//     accountType: Joi.string().valid('base', 'premium').default('base'),
//     isVerified: Joi.boolean().default(false),
//     isDeleted: Joi.boolean().default(false),
// });


export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d).{8,}$'))
        .optional()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain both letters and numbers',
        }),
    age: Joi.number().integer().min(0).optional(),
    phone: Joi.string().pattern(/^\+?\d{7,15}$/).optional(),
    roles: Joi.string().valid(...Object.values(RoleEnum)).optional(),
    isVerified: Joi.boolean().optional(),
    isDeleted: Joi.boolean().optional(),
}).min(1);

export const userQuerySchema = Joi.object({
    sortBy: Joi.string().valid('name', 'age', 'email').optional(),
    search: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d).{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain both letters and numbers',

        }),
});

export const signUpSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d).{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain both letters and numbers',
        }),
    age: Joi.number().min(0).required(),
    phone: Joi.string().pattern(/^\+?\d{7,15}$/).optional(),

    roles: Joi.array().items(Joi.string().valid('buyer', 'seller')).optional(),

    accountType: Joi.string().valid('base').default('base')

});

export const verifyEmailSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Token is required for email verification',
        'string.base': 'Token must be a string'
    }),
});



