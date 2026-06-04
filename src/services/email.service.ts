import nodemailer, {Transporter} from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import {configs} from '../configs/config';
import {emailConstants} from '../constants/email.constant';
import {EmailTypeEnum} from '../enums/email-type.enum';
import {EmailTypeToPayload} from '../types/email-type-to-payload.type';
import {ICar} from '../interfaces/car.interface';

export class EmailService {
    private transporter: Transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            from: 'No reply',
            auth: {
                user: configs.SMTP_EMAIL,
                pass: configs.SMTP_PASSWORD,
            },
        });

        const hbsOptions = {
            viewEngine: {
                extname: '.hbs',
                defaultLayout: 'main',
                layoutsDir: path.join(process.cwd(), 'src', 'templates', 'layouts'),
                partialsDir: path.join(process.cwd(), 'src', 'templates', 'partials'),
            },
            viewPath: path.join(process.cwd(), 'src', 'templates', 'views'),
            extName: '.hbs',
        };


        this.transporter.use('compile', hbs(hbsOptions));
    }

    public async sendMail<T extends EmailTypeEnum>(
        type: T,
        to: string,
        context: EmailTypeToPayload[T]
        ): Promise<void> {
        const {subject, template} = emailConstants[type];
        const mailOptions = {
            from: `"No Reply" <${configs.SMTP_EMAIL}>`,
            to,
            subject,
            template,
            context: {
                ...context,
                frontUrl: configs.APP_FRONT_URL,
            },
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} with template "${template}"`);
    }

    public async sendCarModerationEmail(car: ICar, seller: { name: string; email: string }, reason: string): Promise<void> {
        await this.sendMail(
            EmailTypeEnum.CAR_MODERATION,
            configs.SMTP_MANAGER_EMAIL,
            {
                carId: car._id.toString(),
                carTitle: car.title,
                sellerName: seller.name,
                sellerEmail: seller.email,
                reason,
                adStatus: car.adStatus
            }
        );
        console.log(`Car moderation email sent for "${car.title}"`);
    }

    public async sendBrandSuggestionEmail(brandName: string, user: { name: string; email: string }): Promise<void> {
        await this.sendMail(
            EmailTypeEnum.BRAND_SUGGESTION,
            configs.SMTP_MANAGER_EMAIL,
            {
                brandName,
                userName: user.name,
                userEmail: user.email
            }
        );
        console.log(`Brand suggestion email sent for "${brandName}"`);
    }
    public async sendModelSuggestionEmail(brandName: string, modelName: string, user: { name: string; email: string }): Promise<void> {
        await this.sendMail(

            EmailTypeEnum.MODEL_SUGGESTION,
            configs.SMTP_MANAGER_EMAIL,
            {
                brandName,
                modelName,
                userName: user.name,
                userEmail: user.email
            }
        );
        console.log(`Model suggestion email sent for "${modelName} "`);
    }

}
export const emailService = new EmailService();

