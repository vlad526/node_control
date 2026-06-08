import {ApiError} from '../errors/api-error';
import {ITokenPair, ITokenPayload} from '../interfaces/token.interface';
import {passwordService} from './password.service';
import {tokenService} from './token.service';
import {userService} from './user.service';
import {TokenTypeEnum} from '../enums/token-type.enum';
import {emailService} from './email.service';
import {EmailTypeEnum} from '../enums/email-type.enum';
import {ActionTokenTypeEnum} from '../enums/action-token-type.enum';
import {ISignIn, IUser} from '../interfaces/user.interface';
import {userRepository} from '../repositories/user.repository';
import {tokenRepository} from '../repositories/token.repository';
import {actionTokenRepository} from '../repositories/action-token.repository';
import {Types} from 'mongoose';
import {mapRolesToEnum} from '../utils/map-roles-to-enum';
import {configs} from '../configs/config';
import {Role} from '../models/role.model';
import {AccountType} from '../enums/account-type.enum';
import {IRole} from '../interfaces/role.interface';

export interface ISignUpDTO {
    name: string;
    email: string;
    password: string;
    age: number;
    roles?: ('buyer' | 'seller')[];
}
class AuthService {

    public async signUp(dto: ISignUpDTO): Promise<{ user: IUser; tokens: ITokenPair }> {
        const password = await passwordService.hashPassword(dto.password);

        let rolesToAssign: IRole[] = [];
        if (dto.roles && dto.roles.length > 0) {
            const allowedRoles = ['buyer', 'seller'];
            const requestedRoles = dto.roles.filter(role => allowedRoles.includes(role as string));

            if (requestedRoles.length === 0) {
                throw new ApiError('Invalid roles provided for registration', 400);
            }

            rolesToAssign = await Role.find({ name: { $in: requestedRoles } });

            if (rolesToAssign.length !== requestedRoles.length) {
                throw new ApiError('One or more requested roles not found in DB', 400);
            }
        } else {
            const defaultRole = await Role.findOne({ name: 'buyer' });
            if (!defaultRole) throw new ApiError('Default role buyer not found', 500);
            rolesToAssign = [defaultRole];
        }

        const user = await userRepository.create({
            ...dto,
            password,
            roles: rolesToAssign.map(r => r._id),
            accountType: AccountType.BASE,
        });
        await user.populate('roles');

        const rolesEnum = await mapRolesToEnum(user.roles);

        const tokens = tokenService.generateTokens({
            userId: user._id.toString(),
            roles: rolesEnum,
            name: user.name,
            email: user.email,
        });

        await tokenRepository.create({ ...tokens, _userId: user._id });


        const verificationToken = tokenService.generateActionTokens(
            {
                userId: user._id.toString(),
                roles: rolesEnum,
                email: user.email,
                name: user.name,
            },
            ActionTokenTypeEnum.VERIFY_EMAIL
        );
        await actionTokenRepository.create({
            _userId: user._id,
            token: verificationToken,
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
        });


        const verificationLink = `${configs.APP_FRONT_URL}/auth/verify-email?token=${verificationToken}`;
        await emailService.sendMail(
            EmailTypeEnum.VERIFY_EMAIL,
            user.email,
            { name: user.name, verifyLink: verificationLink }
        );
        const userData = user.toObject ? user.toObject() : user;
        delete userData.password;

        return { user: userData, tokens };

    }


    public async signIn(dto: ISignIn,): Promise<{ user: IUser; tokens: ITokenPair }> {

        const user = await userRepository.findByEmail(dto.email);
        if (!user) {
            throw new ApiError('User not found', 404);
        }
        if (user.isBanned) {
            throw new ApiError('Your account has been banned', 403);
        }
        const isPasswordCorrect = await passwordService.comparePassword(
            dto.password,
            user.password,
        );
        if (!isPasswordCorrect) {
            throw new ApiError('Invalid credentials', 401);
        }
        const rolesEnum = await mapRolesToEnum(user.roles);

        const tokens = tokenService.generateTokens({
            userId: user._id.toString(),
            roles: rolesEnum,
            name: user.name,
            email: user.email,
        });
        await tokenRepository.create({...tokens, _userId: user._id});

        const userData = user.toObject ? user.toObject() : user;
        delete userData.password;

        return { user: userData, tokens };

    }

    public async refreshToken(refreshToken: string): Promise<ITokenPair> {

        const payload = tokenService.verifyToken(refreshToken, TokenTypeEnum.REFRESH);

        const tokenFromDB = await tokenRepository.findByParams({refreshToken});

        if (!tokenFromDB) {
            throw new ApiError('Invalid refresh token', 401);
        }

        const user = await userService.getById(payload.userId);

        const rolesEnum = await mapRolesToEnum(user.roles);

        const newTokens = tokenService.generateTokens({
            userId: user._id.toString(),
            roles: rolesEnum,
            name: user.name,
            email: user.email,
        });


        await tokenRepository.create({...newTokens, _userId: new Types.ObjectId(user._id)});

        return newTokens;
    }


    public async verifyEmail(jwtPayload: ITokenPayload): Promise<void> {
        const userId = new Types.ObjectId(jwtPayload.userId);

        const user = await userRepository.findById(userId);

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        if (user.isVerified) {
            throw new ApiError('Email is already verified', 400);
        }

        await userRepository.update(userId, {isVerified: true});

        await actionTokenRepository.deleteManyByParams({
            _userId: userId,
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
        });

        console.log(` Email verified for ${user.email}`);
    }
    public async logout(accessToken: string): Promise<void> {

        await tokenRepository.deleteOne({ accessToken });
    }

}

export const authService = new AuthService();
