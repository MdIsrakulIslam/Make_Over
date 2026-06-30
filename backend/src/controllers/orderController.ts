import { Request, Response } from 'express';
import prisma from '../prisma';

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      res.status(400).json({ error: 'Order ID and Email are required' });
      return;
    }

    // Since our DB uses UUIDs like "6ad849b4-2d29-48e3-a866-f9bed7e7f3f5"
    // the user might enter "#ORD-6AD849"
    // Let's strip "#ORD-" if they typed it
    let searchId = orderId;
    if (searchId.startsWith('#ORD-')) {
      searchId = searchId.replace('#ORD-', '');
    }

    // Prisma doesn't have a simple way to search by "starts with" on UUIDs,
    // so we'll just fetch orders for that email and find a match
    const userOrders = await prisma.order.findMany({
      where: {
        user: {
          email: email
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Find the order that matches the ID (either full UUID or partial hex)
    const order = userOrders.find(o => 
      o.id.toUpperCase() === searchId.toUpperCase() || 
      o.id.substring(0, 6).toUpperCase() === searchId.toUpperCase()
    );

    if (!order) {
      res.status(404).json({ error: 'Order not found for this email address' });
      return;
    }

    res.json({
      id: order.id,
      displayId: `#ORD-${order.id.substring(0, 6).toUpperCase()}`,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      }))
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({ error: 'Failed to track order' });
  }
};
