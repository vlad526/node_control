import express, {NextFunction, Request, Response} from 'express';
import {configs} from './configs/config';
import * as mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import {cronRunner} from './cron';
import {authRoutes} from './routes/auth.routes';
import {adminRoutes} from './routes/admin.routes';
import {seedDatabase} from './seeds/seedData';
import {carRoutes} from './routes/car.routes';
import {brandRoutes} from './routes/brand.routes';
import {userRoutes} from "./routes/user.routes";


const app = express();

const port = configs.APP_PORT;
const host = configs.APP_HOST;
const mongo = configs.MONGO_URI;


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());


app.use((req: Request, res: Response, next: NextFunction) => {

    console.log(`${req.method} ${req.path}`);
    next();
});


app.use('/users', adminRoutes);
app.use('/auth', authRoutes);
app.use('/cars', carRoutes);
app.use('/brands', brandRoutes);
app.use('/users', userRoutes);


// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {

    let status = error.status || 500;
    if (error.name === 'ValidationError') {
        status = 400;
    }

    console.error(`[ERROR] ${req.method} ${req.path} | Status: ${status} | Message: ${error.message}`);

    res.status(status).send(error.message);
});

process.on('uncaughtException', (error) => {
    console.error('uncaughtException', error.message, error.stack);
});


app.listen(port, host, async () => {
    try {
        await mongoose.connect(mongo);
        console.log('MongoDB is connected');

        await seedDatabase();
        console.log('Database seeded');

        cronRunner();

        console.log(`Server started on http://${host}:${port}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
});

