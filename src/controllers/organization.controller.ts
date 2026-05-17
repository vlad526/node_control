import {NextFunction, Request, Response} from 'express';
import {organizationRepository} from '../repositories/organization.repository';


class OrganizationController {
    async getAllOrganizations(req: Request, res: Response, next: NextFunction) {
        try {
            const orgs = await organizationRepository.getAll();
            res.json(orgs);
        } catch (e) {
            next(e);
        }

    }

    async getOrganizationById(req: Request, res: Response, next: NextFunction) {
        try {
            const org = await organizationRepository.getById(req.params.id);
            if (!org) return res.status(404).json({message: 'Organization was not found'});
            res.json(org);
        } catch (e) {
            next(e);
        }

    }

    async createOrganization(req: Request, res: Response, next: NextFunction) {
        try {
            const org = await organizationRepository.create(req.body);
            res.status(201).json(org);
        } catch (e) {
            next(e);
        }

    }

    async updateOrganization(req: Request, res: Response, next: NextFunction) {
        try {
            const org = await organizationRepository.update(req.params.id, req.body);
            res.json(org);
        } catch (e) {
            next(e);
        }

    }

    async deleteOrganization(req: Request, res: Response, next: NextFunction) {
        try {
            await organizationRepository.delete(req.params.id);
            res.status(204).send();
        } catch (e) {
            next(e);
        }

    }
}

export const organizationController = new OrganizationController();
