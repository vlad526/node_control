import {ApiError} from '../errors/api-error';
import {ITokenPayload} from '../interfaces/token.interface';
import {IUser, IUserListQuery, IUserListResponse, IUserResponse} from '../interfaces/user.interface';
import {userRepository} from '../repositories/user.repository';
import {userPresenter} from '../presenters/user.presenter';
import {Types} from 'mongoose';
import {passwordService} from './password.service';
import {UploadedFile} from 'express-fileupload';
import {s3Service} from './s3.service';
import {FileItemTypeEnum} from '../enums/file-item-type.enum';
import {AccountType} from "../enums/account-type.enum";

class UserService {
    public async getList(query: IUserListQuery): Promise<IUserListResponse> {
        const [entities, total] = await userRepository.getList(query);
        return userPresenter.toListResDto(entities, total, query);
    }


    public async getById(userId: string): Promise<IUserResponse> {
        const objectId = new Types.ObjectId(userId);
        const user = await userRepository.findById(objectId);
        if (!user) throw new ApiError('User not found', 404);

        return userPresenter.toPublicResDto(user);
    }


    public async get(jwtPayload: ITokenPayload): Promise<IUserResponse> {
        const userId = new Types.ObjectId(jwtPayload.userId);
        const user = await userRepository.findById(userId);
        if (!user) throw new ApiError('User not found', 404);

        return userPresenter.toPublicResDto(user);
    }


    public async update(jwtPayload: ITokenPayload, dto: IUser): Promise<IUserResponse> {
        const userId = new Types.ObjectId(jwtPayload.userId);
        const updatedUser = await userRepository.update(userId, dto);
        if (!updatedUser) throw new ApiError('User not found', 404);

        return userPresenter.toPublicResDto(updatedUser);
    }

    public async delete(userId: string): Promise<void> {
        const id = new Types.ObjectId(userId);
        await userRepository.delete(id);
    }


    public async uploadAvatar(
        {userId}: ITokenPayload,
        file: UploadedFile,
    ): Promise<IUserResponse> {
        const userObjectId = new Types.ObjectId(userId);
        const existingUser = await userRepository.findById(userObjectId);

        if (!existingUser) {
            throw new ApiError('User not found', 404);
        }

        const oldAvatar = existingUser.avatar;
        const newAvatarUrl = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.USER,
            existingUser.id,
        );

        const updatedUser = await userRepository.update(existingUser.id, {
            avatar: newAvatarUrl
        });

        if (oldAvatar) {
            await s3Service.deleteFile(oldAvatar);
        }


        return userPresenter.toPublicResDto(updatedUser!);
    }


    public async deleteAvatar({userId}: ITokenPayload): Promise<IUserResponse> {
        const userObjectId = new Types.ObjectId(userId);
        const existingUser = await userRepository.findById(userObjectId);

        if (!existingUser) {
            throw new ApiError('User not found', 404);
        }
        const {avatar, id} = existingUser;

        if (avatar) {
            await s3Service.deleteFile(avatar);
        }

        const updatedUser = await userRepository.update(id, {avatar: null});
        return userPresenter.toPublicResDto(updatedUser!);
    }

    public async createUser(dto: Partial<IUser>): Promise<Omit<IUser, 'password'>> {
        if (!dto.password) {
            throw new ApiError('Password is required', 400);
        }

        const hashedPassword = await passwordService.hashPassword(dto.password);

        const user = await userRepository.create({
            ...dto,
            password: hashedPassword,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password: _, ...userWithoutPassword} = user.toObject ? user.toObject() : user;
        return userWithoutPassword;
    }

    public async toggleBanUser(userId: string, isBanned: boolean): Promise<IUserResponse> {
        const objectId = new Types.ObjectId(userId);

        const updatedUser = await userRepository.update(objectId, { isBanned });

        if (!updatedUser) throw new ApiError('User not found', 404);

        return userPresenter.toPublicResDto(updatedUser);
    }
    public async upgradeToPremium(userId: string | Types.ObjectId) {
        const objectId = new Types.ObjectId(userId);


        const user = await userRepository.findById(objectId);

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        if (user.accountType === AccountType.PREMIUM) {
            throw new ApiError('You already have a Premium account', 400);
        }


        const updatedUser = await userRepository.update(objectId, { accountType: AccountType.PREMIUM });
        return updatedUser;
    }
}

export const userService = new UserService();