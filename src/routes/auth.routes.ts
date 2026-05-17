import {Router} from 'express';
import {commonMiddleware} from '../middlewares/common.middleware';
import {userMiddleware} from '../middlewares/user.middleware';
import {authController} from '../controllers/auth.controller';
import {signInSchema, userBodySchema} from '../validators/user.validator';
import {authMiddleware} from '../middlewares/auth.middleware';


const router = Router();

router.post('/sign-up',
    commonMiddleware.isBodyValid(userBodySchema),
    userMiddleware.isEmailExist,
    authController.signUp);

router.post(
    '/sign-in',
    commonMiddleware.isBodyValid(signInSchema),
    authController.signIn
);

router.post(
    '/refresh',
    authMiddleware.checkRefreshToken,
    authController.refreshToken,
);


export const authRoutes = router;

