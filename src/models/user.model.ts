import {model, Schema} from 'mongoose';
import {AccountType} from '../enums/account-type.enum';
import {IUser} from '../interfaces/user.interface';


const UserSchema = new Schema({
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true, select: false},
        age: {type: Number, required: true},
        phone: {type: String, required: false},
        avatar: {type: String, required: false},
        roles: {
            type: [Schema.Types.ObjectId],
            ref: 'Role',
        },
        isVerified: {type: Boolean, default: false},
        isDeleted: {type: Boolean, default: false},
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            default: null,
        },
        accountType: {
            type: String,
            enum: Object.values(AccountType),
            default: AccountType.BASE,
        },
    },
     {
         timestamps: true,
         versionKey: false,

     }
 );
export const User = model<IUser>('User', UserSchema);
