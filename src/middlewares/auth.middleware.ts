import {NextFunction, Request, Response} from 'express';
import {ApiError} from '../errors/api-error';
import {tokenService} from '../services/token.service';
import {TokenTypeEnum} from '../enums/token-type.enum';
import {ITokenPayload} from '../interfaces/token.interface';
import {tokenRepository} from '../repositories/token.repository';
import {Types} from 'mongoose';
import {userRepository} from '../repositories/user.repository';
import {ActionTokenTypeEnum} from '../enums/action-token-type.enum';
import {actionTokenRepository} from '../repositories/action-token.repository';


class AuthMiddleware {
    public async checkAccessToken(req: Request, res: Response, next: NextFunction,) {
        try {
            const header = req.headers.authorization;
            if (!header) {
                throw new ApiError('Token is not provided', 401);
            }
            const accessToken = header.split('Bearer ')[1];

            const payload = tokenService.verifyToken(accessToken, TokenTypeEnum.ACCESS) as ITokenPayload;

            const pair = await tokenRepository.findByParams({accessToken});
            if (!pair) {
                throw new ApiError('Token is not valid', 401);
            }
            const userId = new Types.ObjectId(payload.userId);
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            if (user.isBanned) {
                throw new ApiError('Your account has been banned', 403);
            }
            req.user = user;
            console.log(payload);
            res.locals.jwtPayload = payload;

            next();
        } catch (e) {
            next(e);
        }
    }


    public async checkRefreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.body;
            if (!refreshToken) {
                throw new ApiError('Refresh token missing', 401);
            }
            const tokenPair = await tokenRepository.findByParams({refreshToken: refreshToken});
            if (!tokenPair) {
                throw new ApiError('Refresh token is invalid or has been revoked', 401);
            }
            const payload = tokenService.verifyToken(refreshToken, TokenTypeEnum.REFRESH);

            res.locals.jwtPayload = payload;
            next();
        } catch (e) {
            next(e);
        }
    }

    public checkActionToken(type: ActionTokenTypeEnum) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const token = req.body.token as string;
                if (!token) {
                    throw new ApiError('Token is not provided', 401);
                }
                const payload = tokenService.verifyToken(token.trim(), type);

                const tokenEntity = await actionTokenRepository.getByToken(token);
                if (!tokenEntity) {
                    throw new ApiError('Token is not valid', 401);
                }

                res.locals.jwtPayload = payload;
                next();
            } catch (e) {
                next(e);
            }
        };
    }
}
export const authMiddleware = new AuthMiddleware();
