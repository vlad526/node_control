import {User} from '../models/user.model';
import {Role} from '../models/role.model';
import * as bcrypt from 'bcrypt';

export const seedAdmin = async () => {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) return;

    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) throw new Error('Admin role must exist before creating new admin user');

    const hashedPassword = await bcrypt.hash('Password123', 10);

    await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        age:20,
        roles: [adminRole._id],
        isVerified: true,
    });

    console.log('Admin created: admin@example.com / Password123');
};