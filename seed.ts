import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import User from './lib/models/User';
import Employee from './lib/models/Employee';
import ActivityLog from './lib/models/ActivityLog';

// Load environmental variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Alex Johnson',
      email: 'admin@teamdash.com',
      password: 'Admin123!',
      role: 'admin',
      department: 'Engineering',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    });

    // Create regular user
    await User.create({
      name: 'Sarah Williams',
      email: 'user@teamdash.com',
      password: 'User123!',
      role: 'user',
      department: 'Marketing',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    });

    console.log('👤 Created users');

    const employees = [
      { name: 'Emma Thompson', email: 'emma.t@teamdash.com', role: 'developer', department: 'Engineering', status: 'active', salary: 95000, phone: '+1-555-0101' },
      { name: 'James Wilson', email: 'james.w@teamdash.com', role: 'designer', department: 'Design', status: 'active', salary: 82000, phone: '+1-555-0102' },
      { name: 'Olivia Martinez', email: 'olivia.m@teamdash.com', role: 'manager', department: 'Engineering', status: 'active', salary: 115000, phone: '+1-555-0103' },
      { name: 'Liam Brown', email: 'liam.b@teamdash.com', role: 'developer', department: 'Engineering', status: 'active', salary: 88000, phone: '+1-555-0104' },
      { name: 'Sophia Davis', email: 'sophia.d@teamdash.com', role: 'hr', department: 'HR', status: 'active', salary: 72000, phone: '+1-555-0105' },
      { name: 'Noah Miller', email: 'noah.m@teamdash.com', role: 'marketing', department: 'Marketing', status: 'on-leave', salary: 68000, phone: '+1-555-0106' },
      { name: 'Isabella Garcia', email: 'isabella.g@teamdash.com', role: 'designer', department: 'Design', status: 'active', salary: 78000, phone: '+1-555-0107' },
      { name: 'Ethan Anderson', email: 'ethan.a@teamdash.com', role: 'finance', department: 'Finance', status: 'active', salary: 91000, phone: '+1-555-0108' },
      { name: 'Mia Taylor', email: 'mia.t@teamdash.com', role: 'sales', department: 'Sales', status: 'active', salary: 74000, phone: '+1-555-0109' },
      { name: 'Lucas Thomas', email: 'lucas.t@teamdash.com', role: 'developer', department: 'Engineering', status: 'inactive', salary: 85000, phone: '+1-555-0110' },
      { name: 'Charlotte Jackson', email: 'charlotte.j@teamdash.com', role: 'manager', department: 'Marketing', status: 'active', salary: 108000, phone: '+1-555-0111' },
      { name: 'Henry White', email: 'henry.w@teamdash.com', role: 'designer', department: 'Design', status: 'active', salary: 80000, phone: '+1-555-0112' },
      { name: 'Amelia Harris', email: 'amelia.h@teamdash.com', role: 'developer', department: 'Engineering', status: 'active', salary: 92000, phone: '+1-555-0113' },
      { name: 'Benjamin Clark', email: 'benjamin.c@teamdash.com', role: 'sales', department: 'Sales', status: 'on-leave', salary: 71000, phone: '+1-555-0114' },
      { name: 'Evelyn Lewis', email: 'evelyn.l@teamdash.com', role: 'hr', department: 'HR', status: 'active', salary: 69000, phone: '+1-555-0115' },
      { name: 'Alexander Robinson', email: 'alex.r@teamdash.com', role: 'finance', department: 'Finance', status: 'active', salary: 96000, phone: '+1-555-0116' },
      { name: 'Harper Walker', email: 'harper.w@teamdash.com', role: 'marketing', department: 'Marketing', status: 'active', salary: 67000, phone: '+1-555-0117' },
      { name: 'Michael Hall', email: 'michael.h@teamdash.com', role: 'developer', department: 'Engineering', status: 'active', salary: 99000, phone: '+1-555-0118' },
      { name: 'Abigail Young', email: 'abigail.y@teamdash.com', role: 'other', department: 'Operations', status: 'active', salary: 64000, phone: '+1-555-0119' },
      { name: 'Daniel Allen', email: 'daniel.a@teamdash.com', role: 'manager', department: 'Sales', status: 'active', salary: 112000, phone: '+1-555-0120' },
    ];

    const joinedDates = employees.map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - Math.floor(Math.random() * 24));
      d.setDate(Math.floor(Math.random() * 28) + 1);
      return d;
    });

    const createdEmployees = await Employee.insertMany(
      employees.map((emp, i) => ({
        ...emp,
        joinedDate: joinedDates[i],
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name.replace(' ', '')}`,
        createdBy: admin._id,
      }))
    );

    // Seed activity logs
    await ActivityLog.insertMany([
      { action: 'user_registered', description: 'Alex Johnson registered an account', entityType: 'user', entityId: admin._id, entityName: 'Alex Johnson', performedBy: admin._id, performedByName: 'Alex Johnson' },
      ...createdEmployees.slice(0, 5).map((emp) => ({
        action: 'employee_created' as const,
        description: `Alex Johnson added ${emp.name} as a new employee`,
        entityType: 'employee' as const,
        entityId: emp._id,
        entityName: emp.name,
        performedBy: admin._id,
        performedByName: 'Alex Johnson',
      })),
    ]);

    console.log(`✅ Seeded ${createdEmployees.length} employees`);
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: admin@teamdash.com / Admin123!');
    console.log('  User:  user@teamdash.com  / User123!');
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
