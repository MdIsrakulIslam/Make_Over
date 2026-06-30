import prisma from './src/prisma';
async function main() {
  try {
    const products = await prisma.product.findMany();
    console.log(products.map(p => ({name: p.name, stock: p.stock})));
  } catch (e) {
    console.error(e);
  }
}
main();
