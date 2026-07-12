import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Departments
  const itDept = await prisma.department.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: { name: 'IT Support' },
  });
  
  const hrDept = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources' },
  });
  
  const engDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' },
  });

  // 2. Create Categories
  const laptopCat = await prisma.assetCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops', description: 'Company issued laptops' },
  });
  
  const monitorCat = await prisma.assetCategory.upsert({
    where: { name: 'Monitors' },
    update: {},
    create: { name: 'Monitors', description: 'External displays' },
  });
  
  const furnitureCat = await prisma.assetCategory.upsert({
    where: { name: 'Office Furniture' },
    update: {},
    create: { name: 'Office Furniture', description: 'Chairs, desks, etc.' },
  });

  // 3. Create Employees
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      email: 'admin@assetflow.com',
      name: 'System Administrator',
      passwordHash,
      role: 'ADMIN',
      departmentId: itDept.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: {},
    create: {
      email: 'manager@assetflow.com',
      name: 'Alice Manager',
      passwordHash,
      role: 'ASSET_MANAGER',
      departmentId: hrDept.id,
    },
  });
  
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: {},
    create: {
      email: 'employee@assetflow.com',
      name: 'Bob Employee',
      passwordHash,
      role: 'EMPLOYEE',
      departmentId: engDept.id,
    },
  });

  // 4. Create Assets
  const asset1 = await prisma.asset.upsert({
    where: { assetTag: 'LAP-1001' },
    update: {},
    create: {
      assetTag: 'LAP-1001',
      name: 'MacBook Pro 16"',
      serialNumber: 'C02F23932',
      category: { connect: { id: laptopCat.id } },
      department: { connect: { id: engDept.id } },
      registeredBy: { connect: { id: adminUser.id } },
      status: 'ALLOCATED',
      condition: 'NEW',
      isBookable: false,
    },
  });

  const asset2 = await prisma.asset.upsert({
    where: { assetTag: 'LAP-1002' },
    update: {},
    create: {
      assetTag: 'LAP-1002',
      name: 'Dell XPS 15',
      serialNumber: 'DLX9982',
      category: { connect: { id: laptopCat.id } },
      registeredBy: { connect: { id: adminUser.id } },
      status: 'AVAILABLE',
      condition: 'GOOD',
      isBookable: true,
    },
  });

  const asset3 = await prisma.asset.upsert({
    where: { assetTag: 'MON-2001' },
    update: {},
    create: {
      assetTag: 'MON-2001',
      name: 'LG UltraFine 4K',
      category: { connect: { id: monitorCat.id } },
      registeredBy: { connect: { id: adminUser.id } },
      status: 'UNDER_MAINTENANCE',
      condition: 'FAIR',
      isBookable: false,
    },
  });

  const asset4 = await prisma.asset.upsert({
    where: { assetTag: 'FUR-3001' },
    update: {},
    create: {
      assetTag: 'FUR-3001',
      name: 'Herman Miller Aeron',
      category: { connect: { id: furnitureCat.id } },
      department: { connect: { id: hrDept.id } },
      registeredBy: { connect: { id: adminUser.id } },
      status: 'ALLOCATED',
      condition: 'GOOD',
      isBookable: false,
    },
  });

  // 5. Create Allocations
  await prisma.allocation.create({
    data: {
      asset: { connect: { id: asset1.id } },
      holderType: 'EMPLOYEE',
      holderEmployee: { connect: { id: employeeUser.id } },
      createdBy: { connect: { id: adminUser.id } },
      status: 'ACTIVE',
    },
  });

  await prisma.allocation.create({
    data: {
      asset: { connect: { id: asset4.id } },
      holderType: 'DEPARTMENT',
      holderDepartment: { connect: { id: hrDept.id } },
      createdBy: { connect: { id: managerUser.id } },
      status: 'ACTIVE',
    },
  });

  // 6. Create Booking
  await prisma.booking.create({
    data: {
      asset: { connect: { id: asset2.id } },
      requestedBy: { connect: { id: employeeUser.id } },
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 26),   // Tomorrow + 2 hours
      status: 'UPCOMING',
      purpose: 'Client presentation',
    },
  });

  // 7. Create Maintenance Record
  await prisma.maintenanceRequest.create({
    data: {
      asset: { connect: { id: asset3.id } },
      raisedBy: { connect: { id: employeeUser.id } },
      issueDescription: 'Screen flickers intermittently when connected via USB-C.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
