import {Router} from 'express';
import {authMiddleware} from '../middlewares/auth.middleware';
import {userController} from "../controllers/user.controller";


const router = Router();


router.post(
    '/premium',
    authMiddleware.checkAccessToken,
    userController.upgradeToPremium
);



export const userRoutes = router;

