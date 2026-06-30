import "dotenv/config";
import prisma from './src/prisma';

async function main() {
  const seedProductNames = [
    'Luminous Glow Serum',
    'Velvet Matte Lipstick',
    'Hydrating Face Wash'
  ];

  const result = await prisma.product.deleteMany({
    where: {
      name: {
        in: seedProductNames
      }
    }
  });

  console.log(`Deleted ${result.count} seed products.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
