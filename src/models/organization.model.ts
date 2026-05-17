import {model, Schema} from 'mongoose';
import {OrganizationType} from '../enums/organization-type.enum';
import {IOrganization} from '../interfaces/organization.interface';

const OrganizationSchema = new Schema({
        name: {type: String, required: true, unique: true, trim: true,},
        type: {type: String, enum: Object.values(OrganizationType), required: true,},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Organization = model<IOrganization>('Organization', OrganizationSchema);
