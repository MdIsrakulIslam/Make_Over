import { Request, Response } from 'express';
import prisma from '../prisma';

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!wishlist) {
      res.json([]);
      return;
    }

    res.json(wishlist.items);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Upsert the wishlist for the user
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    // Check if the item already exists in the wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      res.status(400).json({ error: 'Product is already in the wishlist' });
      return;
    }

    // Add item to wishlist
    const newItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: productId
      },
      include: {
        product: true
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const productId = req.params.productId as string;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId
        }
      }
    });

    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};
