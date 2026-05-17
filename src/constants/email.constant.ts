import { EmailTypeEnum } from '../enums/email-type.enum';

export const emailConstants = {
    [EmailTypeEnum.WELCOME]: {
        subject: 'Welcome',
        template: 'welcome',
    },
    [EmailTypeEnum.VERIFY_EMAIL]: {
        subject: 'Verify email',
        template: 'verify-email'
},
    [EmailTypeEnum.BRAND_SUGGESTION]: {
        subject: 'Brand Suggestion',
        template: 'brand-suggestion',
    },
    [EmailTypeEnum.CAR_MODERATION]: {
        subject: 'Ad Moderation Required',
        template: 'car-moderation',
    },
};


