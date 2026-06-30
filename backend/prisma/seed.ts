import "dotenv/config";
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@makeover.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: {
      name: 'Admin User',
      email: 'admin@makeover.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Categories
  const skincare = await prisma.category.upsert({
    where: { name: 'Skincare' },
    update: {},
    create: { name: 'Skincare' },
  });

  const makeup = await prisma.category.upsert({
    where: { name: 'Makeup' },
    update: {},
    create: { name: 'Makeup' },
  });

  // Create Products
  const products = [
    {
      name: 'Luminous Glow Serum',
      description: 'Achieve a radiant, flawless complexion with our Luminous Glow Serum. Infused with 15% pure Vitamin C, Hyaluronic Acid, and botanical extracts.',
      price: 2500,
      stock: 50,
      imageUrl: '/product.png',
      categoryId: skincare.id,
    },
    {
      name: 'Velvet Matte Lipstick',
      description: 'A long-lasting, highly pigmented matte lipstick that glides on smoothly without drying your lips.',
      price: 1200,
      stock: 100,
      imageUrl: '/product.png',
      categoryId: makeup.id,
    },
    {
      name: 'Hydrating Face Wash',
      description: 'Gentle, foaming face wash that removes impurities while maintaining the skin\'s natural moisture barrier.',
      price: 850,
      stock: 75,
      imageUrl: '/product.png',
      categoryId: skincare.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
