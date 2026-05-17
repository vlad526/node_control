import { Organization } from '../models/organization.model';
import {IOrganization} from '../interfaces/organization.interface';
import {HydratedDocument} from 'mongoose';

class OrganizationRepository {
    public async getAll():Promise<HydratedDocument<IOrganization>[]> {
        return Organization.find();
    }

    public async getById(id: string):Promise<HydratedDocument<IOrganization> | null>{
        return Organization.findById(id);
    }

    public async create(dto: Partial<IOrganization>): Promise<HydratedDocument<IOrganization>> {
        return Organization.create(dto);
    }

    public async update(id: string, dto:Partial<IOrganization>): Promise<HydratedDocument<IOrganization>> {
        return Organization.findByIdAndUpdate(id, dto, { new: true });
    }

    public async delete(id: string):Promise<void> {
        await Organization.findByIdAndDelete(id);
    }
}

export const organizationRepository = new OrganizationRepository();

