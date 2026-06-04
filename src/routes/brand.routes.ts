import {Router} from 'express';
import {brandController} from '../controllers/brand.controller';
import {requirePermissionMiddleware} from '../middlewares/require-permission';
import {authMiddleware} from '../middlewares/auth.middleware';

const router = Router();


router.get('/',
    brandController.getAllBrands);


router.post(
    '/suggest/brand',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('create_car'),
    brandController.suggestBrand
);
router.post(
    '/suggest/model',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('create_car'),
    brandController.suggestModel
);
export const brandRoutes = router;
