import {Router} from 'express';
import {carController} from '../controllers/car.controller';
import {authMiddleware} from '../middlewares/auth.middleware';
import {carMiddleware} from '../middlewares/car.middleware';
import {requirePermissionMiddleware} from '../middlewares/require-permission';


const router = Router();

router.get('/stats/:id',
    authMiddleware.checkAccessToken,
    carMiddleware.checkPremiumAccess,
    carController.getCarStats);

router.get('/:id',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('view_car'),
    carMiddleware.filterActiveAds,
    carController.getById);

router.get('/',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('view_car'),
    carMiddleware.filterActiveAds,
    carController.getAll);

router.post('/create',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('create_car'),
    carMiddleware.validateBody,
    carController.createCar);

router.put('/edit/:id',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('edit_car'),
    carMiddleware.validateBody,
    carController.editCar);

router.patch('/update-prices',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('all'),
    carController.updatePrices);

router.post(
    '/verify-car/:carId',
    authMiddleware.checkAccessToken,
    requirePermissionMiddleware('verify_car'),
    carController.verifyCar
);

router.delete('/:carId',
    authMiddleware.checkAccessToken,
    carController.delete);

export const carRoutes = router;



