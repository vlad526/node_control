import {model, Schema} from 'mongoose';
import {RoleScope} from '../enums/role-scope.enum';
import {IRole} from '../interfaces/role.interface';
import {RoleEnum} from '../enums/role.enum';


const RoleSchema = new Schema({
        name: {
                type: String, enum: Object.values(RoleEnum), required: true, unique: true,},
        organizationId: {
                type: Schema.Types.ObjectId, ref: 'Organization',},
        scope: {
                type: String, enum: Object.values(RoleScope), required: true,},
        permissions: [{
                type: Schema.Types.ObjectId, ref: 'Permission'},],},
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Role = model<IRole>('Role', RoleSchema);

