import { User } from '../models/user.model';
import {IUser, IUserListQuery} from '../interfaces/user.interface';
import {FilterQuery, HydratedDocument, Types} from 'mongoose';
import {ObjectId} from '../types/common';


class UserRepository {
    public async getList(query: IUserListQuery): Promise<[IUser[], number]> {
        const filterObj: FilterQuery<IUser> = {'isVerified': false};
        if (query.search) {
            filterObj.name = {$regex: query.search, $options: 'i'};
        }
        const sort: Record<string, 1 | -1> = {};
        if (query.orderBy && query.order) {
            sort[query.orderBy] = query.order === 'asc' ? 1 : -1;
        }

        const skip = query.limit * (query.page - 1);
        const [entities, count] = await Promise.all([

            User.find(filterObj).populate('roles').sort(sort).limit(query.limit).skip(skip),
            User.countDocuments(filterObj),
        ]);
        return [entities, count];
    }

    public async create(dto: Partial<IUser>): Promise<HydratedDocument<IUser>> {
        return User.create(dto);
    }

    public async findById(id: ObjectId): Promise<HydratedDocument<IUser> | null> {
        return User.findById(id).populate('roles').exec();
    }

    public async findByIdWithRoles  (userId: Types.ObjectId):Promise<HydratedDocument<IUser> | null> {

        return User.findById(userId)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

    };
    public async findByEmail(email: string): Promise<HydratedDocument<IUser> | null> {
        return User.findOne({email}).populate('roles').select('+password');
    }

    public async findAll(): Promise<HydratedDocument<IUser>[]> {
        return User.find().populate('roles');
    }

    public async update(id: ObjectId, dto: Partial<IUser>): Promise<HydratedDocument<IUser>> {
        return User.findByIdAndUpdate(id, dto, {new: true}).populate('roles').exec();
    }

    public async delete(id: ObjectId): Promise<void> {
        await User.findByIdAndDelete(id);
    }
}


export const userRepository = new UserRepository();
