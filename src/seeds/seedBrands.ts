import {Brand} from '../models/brand.model';


export const seedBrandsWithModels = async () => {
    try {

           await Brand.deleteMany({});

        const brandsWithModels = [
            {
                name: 'Toyota',
                models: ['Corolla', 'Camry', 'RAV4', 'Land Cruiser']
            },
            {
                name: 'BMW',
                models: ['3 Series', '5 Series', 'X3', 'X5']
            },
            {
                name: 'Mercedes-Benz',
                models: ['A-Class', 'C-Class', 'E-Class', 'GLC', 'GLE']
            },
            {
                name: 'Volkswagen',
                models: ['Golf', 'Passat', 'Tiguan', 'Touareg']
            },
            {
                name: 'Ford',
                models: ['Fiesta', 'Focus', 'Mondeo', 'Kuga']
            },
            {
                name: 'Audi',
                models: ['A3', 'A4', 'A6', 'Q5', 'Q7']
            },
            {
                name: 'Honda',
                models: ['Civic', 'Accord', 'CR-V', 'HR-V']
            },
            {
                name: 'Nissan',
                models: ['Micra', 'Qashqai', 'X-Trail', 'Navara']
            },
            {
                name: 'Hyundai',
                models: ['Elantra', 'Tucson', 'Santa Fe', 'Sonata']
            },
            {
                name: 'Kia',
                models: ['Rio', 'Sportage', 'Sorento', 'Ceed']
            },
            {
                name: 'Mazda',
                models: ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-9']
            },
            {
                name: 'Chevrolet',
                models: ['Aveo', 'Cruze', 'Captiva', 'Tahoe']
            },
            {
                name: 'Skoda',
                models: ['Fabia', 'Octavia', 'Superb', 'Kodiaq']
            },
            {
                name: 'Renault',
                models: ['Clio', 'Megane', 'Captur', 'Kadjar']
            },
            {
                name: 'Peugeot',
                models: ['208', '308', '3008', '5008']
            },
            {
                name: 'Opel',
                models: ['Astra', 'Corsa', 'Insignia', 'Mokka']
            },
            {
                name: 'Volvo',
                models: ['S60', 'S90', 'XC60', 'XC90']
            }
];

        for (const brand of brandsWithModels) {
            await Brand.findOneAndUpdate(
                { name: brand.name },
                { name: brand.name, models: brand.models },
                { upsert: true, new: true }
            );
        }
    console.log('Brands and models are seeded');

    } catch (error) {
        console.error(' Seed error:', error);
    }

};
