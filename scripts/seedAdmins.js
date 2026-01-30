import db from '../src/config/database.js';
import User from '../src/models/userModel.js';

const admins = [
    { 
        name: 'Alpha', 
        email: 'alpha@mulatama.studio', 
        pass: 'alpha123', 
        level: 3 
    },
    { 
        name: 'Gamma', 
        email: 'gamma@mulatama.studio', 
        pass: 'gamma123', 
        level: 2 
    },
    { 
        name: 'Beta', 
        email: 'beta@mulatama.studio', 
        pass: 'beta123', 
        level: 2 
    },
    { 
        name: 'Delta', 
        email: 'delta@mulatama.studio', 
        pass: 'delta123', 
        level: 2 
    },
    { 
        name: 'Omega', 
        email: 'omega@mulatama.studio', 
        pass: 'omega123', 
        level: 1 
    }
];

const seedAdmins = async () => {
    try {
        await db.authenticate();
        console.log('Database connected...');

        for (const admin of admins) {
            const existingUser = await User.findOne({ where: { email: admin.email } });
            
            if (existingUser) {
                console.log(`Skipped: ${admin.name} already exists.`);
                continue;
            }

            await User.create({
                name: admin.name,
                email: admin.email,
                password: admin.pass,
                level: admin.level
            });

            console.log(`Created: ${admin.name}`);
        }

        console.log('All admins seeded successfully!');

    } catch (error) {
        console.error('Seeder Failed:', error);
    } finally {
        await db.close();
    }
};

seedAdmins();