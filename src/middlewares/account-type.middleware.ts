import {Request, Response, NextFunction} from 'express';
import {AccountType} from '../enums/account-type.enum';
import {IUser} from '../interfaces/user.interface';
import {ApiError} from '../errors/api-error';


class AccountTypeMiddleware {
    public verifyAccess(requiredType: AccountType) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = req.user as IUser;

                if (!user || user.accountType !== requiredType) {
                    throw new ApiError(`${requiredType} account required`, 403 );
                }

                next();
            } catch (e) {
                console.error('Require Premium middleware error:', e);
                next(e);
            }
        };
    }
}

export const accountTypeMiddleware = new AccountTypeMiddleware();
