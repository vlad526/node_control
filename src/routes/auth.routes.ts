import {Router} from 'express';
import {commonMiddleware} from '../middlewares/common.middleware';
import {userMiddleware} from '../middlewares/user.middleware';
import {authController} from '../controllers/auth.controller';
import {signInSchema, signUpSchema} from '../validators/user.validator';
import {authMiddleware} from '../middlewares/auth.middleware';
import {userController} from "../controllers/user.controller";


const router = Router();

router.post('/sign-up',
    commonMiddleware.isBodyValid(signUpSchema),
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
router.post(
    '/premium',
    authMiddleware.checkAccessToken,
    userController.upgradeToPremium
);
router.post(
    '/logout',
    authMiddleware.checkAccessToken,
    authController.logout
);


export const authRoutes = router;

