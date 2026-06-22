import {GetCarsQuery, ICar} from '../interfaces/car.interface';
import {AdStatusEnum} from '../enums/ad-status.enum';
import {Car} from '../models/car.model';
import {containsProfanity} from '../utils/check-profanity';
import {convertPrices} from '../utils/price-converter';
import {CurrencyService} from './currency.service';
import {emailService} from './email.service';
import {IUser} from '../interfaces/user.interface';
import {AccountType} from '../enums/account-type.enum';
import {carRepository} from '../repositories/car.repository';
import {Types} from 'mongoose';
import {ApiError} from '../errors/api-error';
import {CarModel} from "../models/car-model.model";
import {Brand} from "../models/brand.model";
import {CarView} from "../models/car-view.model";


export class CarService {
    currencyService: CurrencyService;


    constructor() {
        this.currencyService = new CurrencyService();

    }

    public async createCar(user: IUser, data: Partial<ICar>): Promise<ICar> {


        if (user.accountType === AccountType.BASE) {
            const activeOrPendingCarsCount = await Car.countDocuments({
                sellerId: user._id,
                adStatus: { $in: [AdStatusEnum.ACTIVE, AdStatusEnum.PENDING] }
            });

            if (activeOrPendingCarsCount >= 1) {
                throw new ApiError('Base accounts are limited to 1 active or pending ad. Please upgrade to Premium.', 403);
            }
        }


        if (!data.price || !data.currency) {
            throw new ApiError('You must specify the price and currency of the car', 400);
        }


        if (!data.brand || !data.model) {
            throw new ApiError('You must specify both the brand and the model of the car', 400);
        }


        const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${data.brand}$`, 'i') } });
        if (!brandDoc) {
            throw new ApiError(`Brand '${data.brand}' does not exist in the database`, 404);
        }


        const modelDoc = await CarModel.findOne({
            name: { $regex: new RegExp(`^${data.model}$`, 'i') },
            brandId: brandDoc._id
        });

        if (!modelDoc) {
            throw new ApiError(`Model '${data.model}' does not exist for brand '${brandDoc.name}'`, 404);
        }


        const { hasProfanity, words } = containsProfanity(`${data.title ?? ''} ${data.description ?? ''}`);


        const rates = await this.currencyService.getAllRates();
        const converted = convertPrices(data.price, data.currency, rates);


        const car = new Car({
            ...data,
            brand: brandDoc._id,
            model: modelDoc._id,
            sellerId: user._id,
            adStatus: hasProfanity ? AdStatusEnum.PENDING : AdStatusEnum.ACTIVE,
            hasProfanity,
            profaneWords: words,
            editAttempts: 0,
            priceUSD: converted.USD,
            priceEUR: converted.EUR,
            priceUAH: converted.UAH,
            priceRate: rates[data.currency],
            priceSource: 'PrivatBank API',
        });


        const savedCar = await car.save();


        const carResponse = savedCar.toObject();


        carResponse.brand = brandDoc.name;
        carResponse.model = modelDoc.name;


        return carResponse as any;
    }

    public async editCar(carId: string, dto: Partial<ICar>, user: IUser): Promise<ICar> {
        const car = await carRepository.findById(carId);
        if (!car) {
            throw new ApiError('Car advertisement not found', 404);
        }
        if (car.sellerId.toString() !== user._id.toString()) {
            throw new ApiError('You can only edit your own cars', 403);
        }


        delete dto.editAttempts;
        delete dto.adStatus;
        delete dto.hasProfanity;
        delete dto.profaneWords;
        delete dto.sellerId;


        if (dto.brand || dto.model) {
            let currentBrandId = car.brand;


            if (dto.brand) {
                const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${dto.brand}$`, 'i') } });
                if (!brandDoc) {
                    throw new ApiError(`Brand '${dto.brand}' does not exist in the database`, 404);
                }
                car.brand = brandDoc._id as any;
                currentBrandId = brandDoc._id;
                delete dto.brand;
            }


            if (dto.model) {
                const modelDoc = await CarModel.findOne({
                    name: { $regex: new RegExp(`^${dto.model}$`, 'i') },
                    brandId: currentBrandId
                });

                if (!modelDoc) {
                    throw new ApiError(`We don't have the '${dto.model}' model for this brand yet. You can suggest adding it via /brands/models/suggest`, 404);
                }
                car.model = modelDoc._id as any;
                delete dto.model;
            }
        }


        Object.assign(car, dto);


        const { hasProfanity, words } = containsProfanity(`${car.title} ${car.description}`);

        if (hasProfanity) {
            car.editAttempts = (car.editAttempts || 0) + 1;
            car.hasProfanity = true;
            car.profaneWords = words;

            if (car.editAttempts >= 3) {
                car.adStatus = AdStatusEnum.INACTIVE;
                await emailService.sendCarModerationEmail(
                    car,
                    { name: user.name, email: user.email },
                    'Suspicious language: maximum edit attempts (3) exceeded.'
                );
            } else {
                car.adStatus = AdStatusEnum.PENDING;
            }
        } else {
            car.hasProfanity = false;
            car.profaneWords = [];
            car.adStatus = AdStatusEnum.ACTIVE;
            car.editAttempts = 0;
        }


        if (dto.price || dto.currency) {
            const rates = await this.currencyService.getAllRates();
            const converted = convertPrices(car.price, car.currency, rates);

            car.priceUSD = converted.USD;
            car.priceEUR = converted.EUR;
            car.priceUAH = converted.UAH;
            car.priceRate = rates[car.currency];
            car.priceSource = 'PrivatBank API';
        }


        await car.save();


        return car;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
     public async getCarStats(carId: string, user: IUser) {
        const car = await carRepository.findById(carId);
        if (!car) return null;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);


        const [totalViews, viewsToday, viewsWeek, viewsMonth] = await Promise.all([

            CarView.countDocuments({ carId: car._id }),
            CarView.countDocuments({ carId: car._id, date: { $gte: startOfDay } }),
            CarView.countDocuments({ carId: car._id, date: { $gte: startOfWeek } }),
            CarView.countDocuments({ carId: car._id, date: { $gte: startOfMonth } })
        ]);

        const avgPriceRegion = await Car.aggregate([
            {$match: { region: car.region, adStatus: AdStatusEnum.ACTIVE }},
            {$group: {_id: null, avgPrice: {$avg: '$priceUAH'}}}
        ]);

        const avgPriceUA = await Car.aggregate([
            {$match: { adStatus: AdStatusEnum.ACTIVE }},
            {$group: {_id: null, avgPrice: {$avg: '$priceUAH'}}}
        ]);
        return {
            totalViews,
            viewsToday,
            viewsWeek,
            viewsMonth,
            avgPriceRegion: avgPriceRegion[0]?.avgPrice || 0,
            avgPriceUA: avgPriceUA[0]?.avgPrice || 0,
        };
    }

    public async updatePrices(): Promise<void> {
        const cars = await carRepository.findQuery({ adStatus: AdStatusEnum.ACTIVE });
        const rates = await this.currencyService.getAllRates();

        await Promise.all(
            cars.map(async (car) => {
                const converted = convertPrices(car.price, car.currency, rates);


                await carRepository.updateCar(car._id, {
                    priceUAH: converted.UAH,
                    priceUSD: converted.USD,
                    priceEUR: converted.EUR,
                    priceRate: rates[car.currency] || 1,
                    priceSource: 'PrivatBank API'
                });
            })
        );
    }

    public async getCarById(carId: string): Promise<ICar | null> {
        const car = await carRepository.findById(carId);
        if (!car) return null;


        await CarView.create({ carId: car._id });

        return car;
    }


    public async getAllCars(query: GetCarsQuery, user?: IUser) {
        const filter: Record<string, unknown> = {};

        if (query.region) filter.region = query.region;


        if (query.brand) {
            const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${query.brand}$`, 'i') } });

            if (brandDoc) {
                filter.brand = brandDoc._id;
            } else {
                filter.brand = null;
            }
        }

        if (query.currency) filter.currency = query.currency;
        if (query.adStatus) filter.adStatus = query.adStatus;

        if (query.minPrice) filter.price = { ...(filter.price as Record<string, unknown>), $gte: Number(query.minPrice) };
        if (query.maxPrice) filter.price = { ...(filter.price as Record<string, unknown>), $lte: Number(query.maxPrice) };

        if (user?.accountType === AccountType.PREMIUM) {
            if (query.adStatus) filter.adStatus = query.adStatus;
        } else {
            filter.adStatus = AdStatusEnum.ACTIVE;
        }

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [cars, total] = await Promise.all([
            carRepository.findQuery(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            carRepository.countDocuments(filter)
        ]);

        console.log(`Found cars on page ${page}: ${cars.length} (Total matching cars: ${total})`);

        return {
            data: cars,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    public async verifyCar(carId: string) {
        const objectId = new Types.ObjectId(carId);

        return carRepository.updateCar(objectId, {
            adStatus: AdStatusEnum.ACTIVE,
            hasProfanity: false,
            profaneWords: [],
            editAttempts: 0
        });
    }

    public async deleteCar(carId: string, user: IUser) {
        const car = await carRepository.findById(carId);

        if (!car) {
            throw new ApiError('Car not found', 404);
        }

        const isAdminOrManager = user.roles?.some((r: any) =>
            r.name === 'admin' || r.name === 'manager'
        );

        if (car.sellerId.toString() !== user._id.toString() && !isAdminOrManager) {
            throw new ApiError('Forbidden: You can only delete your own cars', 403);
        }

        const objectId = new Types.ObjectId(carId);
        return carRepository.deleteCar(objectId);
    }

}
export const carService = new CarService();

