import prisma from './src/prisma';
async function main() {
    try {
        const user = await prisma.user.findFirst();
        const product = await prisma.product.findFirst();
        console.log('User:', user.id, 'Product:', product.id);
        
        const wishlist = await prisma.wishlist.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id }
        });
        console.log('Wishlist created:', wishlist.id);
        
        const newItem = await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId: product.id
            }
        });
        console.log('Item created:', newItem.id);
    } catch (e) {
        console.error(e);
    }
}
main();
