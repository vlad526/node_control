import { EmailTypeEnum } from '../enums/email-type.enum';
import { EmailPayloadCombined } from './email-payload-combined.type';
import { PickRequired } from './pick-required.type';

export type EmailTypeToPayload = {
    [EmailTypeEnum.WELCOME]: PickRequired<EmailPayloadCombined, 'name'>;

    [EmailTypeEnum.VERIFY_EMAIL]: PickRequired<EmailPayloadCombined, 'name'|'verifyLink'>;

    [EmailTypeEnum.BRAND_SUGGESTION]: PickRequired<EmailPayloadCombined, 'brandName'| 'userName'| 'userEmail'>;

    [EmailTypeEnum.CAR_MODERATION]: PickRequired<EmailPayloadCombined, 'carId'| 'carTitle'| 'sellerName'| 'sellerEmail' | 'reason'| 'adStatus'>;

    [EmailTypeEnum.MODEL_SUGGESTION]: PickRequired<EmailPayloadCombined, 'brandName' | 'modelName' | 'userName' | 'userEmail'>;
       };