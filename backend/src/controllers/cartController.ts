import { Request, Response } from 'express';
import prisma from '../prisma';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const syncCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { items } = req.body;

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const existingItem = await prisma.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.id
            }
          }
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.id,
              quantity: item.quantity
            }
          });
        }
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { productId, quantity } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: quantity || 1
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const productId = req.params.productId as string;
    const { amount } = req.body;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const newQuantity = existingItem.quantity + amount;

    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: existingItem.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const productId = req.params.productId as string;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
