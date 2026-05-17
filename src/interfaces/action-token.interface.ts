import { ActionTokenTypeEnum } from '../enums/action-token-type.enum';
import {ObjectId} from '../types/common';

export interface IActionToken {
    _id?: ObjectId;
    _userId: ObjectId;
    token: string;
    type: ActionTokenTypeEnum;
}