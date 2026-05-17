import {model, Schema} from 'mongoose';
import {IPermission} from '../interfaces/permission.interface';

const PermissionSchema = new Schema({
        code: {type: String, required: true, unique: true,},
        description: {type: String, required: false,},
    },
    {
        timestamps: true,
        versionKey: false,
    }

);

export const Permission = model<IPermission>('Permission', PermissionSchema);

