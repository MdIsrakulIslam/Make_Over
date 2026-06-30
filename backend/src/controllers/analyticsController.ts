import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || "This Month";

    const now = new Date();
    let startDate = new Date();

    switch(filter) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "This Week":
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case "This Month":
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "This Year":
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(1); // Default to this month
        startDate.setHours(0, 0, 0, 0);
    }

    // 1. Get total stats for the selected period
    const customersCount = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate }
      }
    });

    const ordersCount = await prisma.order.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Products (keep it all time as they don't fluctuate as rapidly)
    const productsCount = await prisma.product.count();

    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      },
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      }
    });
    
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // 2. Revenue Chart Data (AreaChart) - last 6 months revenue
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthRev = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { not: 'CANCELLED' }
        }
      });
      
      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
      revenueData.push({
        name: monthName,
        revenue: monthRev._sum.totalPrice || 0
      });
    }

    // 3. Engagement Chart Data (BarChart) - users registered in the last 7 days
    const engagementData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dailyUsers = await prisma.user.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      const dayName = startOfDay.toLocaleString('default', { weekday: 'short' });
      engagementData.push({
        name: dayName,
        users: dailyUsers
      });
    }

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        items: {
          select: {
            product: { select: { name: true } }
          },
          take: 1
        }
      }
    });

    const formattedRecentOrders = recentOrders.map(order => ({
      id: `#ORD-${order.id.substring(0, 6).toUpperCase()}`,
      customer: order.user.name,
      product: order.items.length > 0 ? order.items[0].product.name : "Unknown",
      amount: `৳ ${order.totalPrice.toLocaleString('en-IN')}`,
      status: order.status,
      color: order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
             order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
             order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }));

    // ----- Inventory Alerts -----
    const lowStockAlerts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5 // Alert for products with 5 or less stock
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        imageUrl: true
      },
      orderBy: { stock: 'asc' }
    });

    res.json({
      stats: {
        revenue: totalRevenue,
        orders: ordersCount,
        customers: customersCount,
        products: productsCount
      },
      revenueData,
      engagementData,
      recentOrders: formattedRecentOrders,
      lowStockAlerts
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Server error calculating analytics" });
  }
};
