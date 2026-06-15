import Joi from 'joi';



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




