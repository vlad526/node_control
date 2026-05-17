import {GetCarsQuery, ICar} from '../interfaces/car.interface';
import {AdStatusEnum} from '../enums/ad-status.enum';
import {Car} from '../models/car.model';
import {containsProfanity} from '../utils/check-profanity';
import {convertPrices} from '../utils/price-converter';
import {CurrencyService} from './currency.service';
import {emailService} from './email.service';
import {AdRepository} from '../repositories/ad.repository';
import {IAd} from '../interfaces/ad.interface';
import {IUser} from '../interfaces/user.interface';
import {AccountType} from '../enums/account-type.enum';
import {carRepository} from '../repositories/car.repository';
import {Types} from 'mongoose';
import {ApiError} from '../errors/api-error';


export class CarService {
    currencyService: CurrencyService;
    adRepository: AdRepository;

    constructor() {
        this.currencyService = new CurrencyService();
        this.adRepository = new AdRepository();
    }

    public async createCar(user: IUser, data: Partial<ICar>): Promise<ICar> {

        if (user.accountType === AccountType.BASE) {
            const activeCarsCount = await carRepository.countActiveBySeller(user._id);
            if (activeCarsCount >= 1) {
                throw new ApiError('Base accounts are limited to 1 active ad. Please upgrade to Premium.', 403);
            }
        }

        if (!data.price || !data.currency) {
            throw new ApiError('You must specify the price and currency of the car', 400);
        }


        const { hasProfanity, words } = containsProfanity(`${data.title ?? ''} ${data.description ?? ''}`);

        const rates = await this.currencyService.getAllRates();
        const converted = convertPrices(data.price, data.currency, rates);


        const car = new Car({
            ...data,
            sellerId: user._id,

            adStatus: hasProfanity ? AdStatusEnum.PENDING : AdStatusEnum.ACTIVE,
            hasProfanity,
            profaneWords: words,
            editAttempts: hasProfanity ? 1 : 0,
            priceUSD: converted.USD,
            priceEUR: converted.EUR,
            priceUAH: converted.UAH,
            priceRate: rates[data.currency],
        });

        return car.save();
    }

    public async editCar(carId: string, dto: Partial<ICar>, user: IUser): Promise<ICar> {
        const car = await carRepository.findById(carId);
        if (!car) {
            throw new ApiError('Car advertisement not found', 404);
        }


        delete dto.editAttempts;
        delete dto.adStatus;
        delete dto.hasProfanity;
        delete dto.profaneWords;
        delete dto.sellerId;


        const { model, ...otherData } = dto;
        if (model) car.set('model', model);
        Object.assign(car, otherData);


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
        }


        const rates = await this.currencyService.getAllRates();
        const converted = convertPrices(car.price, car.currency, rates);

        car.priceUSD = converted.USD;
        car.priceEUR = converted.EUR;
        car.priceUAH = converted.UAH;
        car.priceRate = rates[car.currency];


        return car.save();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async getCarStats(carId: string, user: IUser) {


        const car = await carRepository.findById(carId);
        if (!car) return null;

        const now = new Date();
        const totalViews = car.views.length;
        const viewsToday = car.views.filter(v => v.date.toDateString() === now.toDateString()).length;
        const viewsWeek = car.views.filter(v => v.date > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
        const viewsMonth = car.views.filter(v => v.date > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).length;

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
        const ads = await this.adRepository.findActiveAds();
        const rates = await this.currencyService.getAllRates();

        await Promise.all(
            ads.map(async (ad: IAd) => {
                if (ad.currency !== 'UAH') {
                    const converted = convertPrices(ad.price, ad.currency, rates);
                    await this.adRepository.updateAdPrice(ad._id.toString(), converted.UAH, rates[ad.currency]);
                }
            })
        );
    }

    public async getCarById(carId: string): Promise<ICar | null> {
        const car = await carRepository.findById(carId);
        if (!car) return null;

        car.views.push({ date: new Date() });
        await car.save();

        return car;
    }

    public async getAllCars(query: GetCarsQuery, user?: IUser): Promise<ICar[]> {
        const filter: Record<string, unknown> = {};

        if (query.region) filter.region = query.region;
        if (query.brand) filter.brand = query.brand;
        if (query.currency) filter.currency = query.currency;
        if (query.adStatus) filter.adStatus = query.adStatus;

        if (query.minPrice) filter.price = { ...(filter.price as Record<string, unknown>), $gte: Number(query.minPrice) };
        if (query.maxPrice) filter.price = { ...(filter.price as Record<string, unknown>), $lte: Number(query.maxPrice) };


        if (user?.accountType === AccountType.PREMIUM) {
            if (query.adStatus) filter.adStatus = query.adStatus;
        } else {
            filter.adStatus = AdStatusEnum.ACTIVE;
        }
        const cars = await carRepository.findQuery(filter).sort({ createdAt: -1 });

        console.log(`Found cars: ${cars.length}`);
        if (cars.length > 0) {
            console.log('Sample car:', cars[0]);
        }

        return cars;
    }
    public async verifyCar(carId: string) {
        const objectId = new Types.ObjectId(carId);
        return carRepository.updateCar(objectId, { verified: true });
    }

    public async deleteCar(carId: string) {
        const objectId = new Types.ObjectId(carId);
        return carRepository.deleteCar(objectId);
    }
}
export const carService = new CarService();

