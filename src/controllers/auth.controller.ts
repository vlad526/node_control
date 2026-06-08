import {NextFunction, Request, Response} from 'express';
import {ITokenPair, ITokenPayload} from '../interfaces/token.interface';
import {authService, ISignUpDTO} from '../services/auth.service';
import {userPresenter} from '../presenters/user.presenter';



class AuthController {

    public async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as ISignUpDTO;


            const { user, tokens } = await authService.signUp(dto);

            res.status(201).json({
                user: userPresenter.toPublicResDto(user),
                ...tokens
            });
        } catch (e) {
            next(e);
        }
    }


    public async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, password} = req.body;
            const { user, tokens } = await authService.signIn({email, password});

            res.status(200).json({
                user: userPresenter.toPublicResDto(user),
                ...tokens
            });
        } catch (e) {
            next(e);
        }
    }

    public async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.body as ITokenPair;
            const result = await authService.refreshToken(refreshToken);

            res.status(201).json(result);
        } catch (e) {
            next(e);
        }
    }


    public async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtPayload = res.locals.jwtPayload as ITokenPayload;

            await authService.verifyEmail(jwtPayload);
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (e) {
            next(e);
        }
    }
    public async logout(req: Request, res: Response, next: NextFunction) {
        try {

            const accessToken = req.get('Authorization')?.split(' ')[1];

            if (accessToken) {
                await authService.logout(accessToken);
            }

            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();