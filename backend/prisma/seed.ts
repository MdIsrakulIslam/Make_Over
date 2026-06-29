import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
