import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { TokenTypeEnum } from '../enums/token-type.enum';
import { ApiError } from '../errors/api-error';
import { ITokenPair, ITokenPayload } from '../interfaces/token.interface';
import {configs} from '../configs/config';
import {ActionTokenTypeEnum} from '../enums/action-token-type.enum';

class TokenService {
        public generateTokens(payload: ITokenPayload): ITokenPair {
        const accessToken = jwt.sign(
            payload,
            configs.JWT_ACCESS_SECRET as Secret,
            { expiresIn: configs.JWT_ACCESS_EXPIRATION as SignOptions['expiresIn'] }
        );

        const refreshToken = jwt.sign(
            payload,
            configs.JWT_REFRESH_SECRET as Secret,
            { expiresIn: configs.JWT_REFRESH_EXPIRATION as SignOptions['expiresIn'] }
        );

        return { accessToken, refreshToken };
    }


      public verifyToken(token: string, type: TokenTypeEnum | ActionTokenTypeEnum): ITokenPayload {
        try {
            let secret: Secret;
            switch (type) {
                case TokenTypeEnum.ACCESS:
                    secret = configs.JWT_ACCESS_SECRET as Secret;
                    break;

                case TokenTypeEnum.REFRESH:
                    secret = configs.JWT_REFRESH_SECRET as Secret;
                    break;

                // case ActionTokenTypeEnum.FORGOT_PASSWORD:
                //     secret = configs.ACTION_FORGOT_PASSWORD_SECRET as Secret;
                //     break;

                case ActionTokenTypeEnum.VERIFY_EMAIL:
                    secret = configs.ACTION_VERIFY_EMAIL_SECRET as Secret;
                    break;

                default:
                    throw new ApiError('Invalid token type', 400);
            }

            return jwt.verify(token, secret) as ITokenPayload;
        } catch (error) {
            console.error(error);
            throw new ApiError('Invalid or expired token', 401);
        }
    }


    public generateActionTokens(
        payload: ITokenPayload,
        tokenType: ActionTokenTypeEnum,
    ): string {
        let secret: string;
        let expiresIn: string;

        switch (tokenType) {
            // case ActionTokenTypeEnum.FORGOT_PASSWORD:
            //     secret = configs.ACTION_FORGOT_PASSWORD_SECRET;
            //     expiresIn = configs.ACTION_FORGOT_PASSWORD_EXPIRATION;
            //     break;

            case ActionTokenTypeEnum.VERIFY_EMAIL:
                secret = configs.ACTION_VERIFY_EMAIL_SECRET;
                expiresIn = configs.ACTION_VERIFY_EMAIL_EXPIRATION;
                break;

            default:
                throw new ApiError('Invalid token type', 400);
        }

        return jwt.sign(
            payload,
            secret as Secret,
            { expiresIn: expiresIn as SignOptions['expiresIn'] }
        );
    }


}

export const tokenService = new TokenService();