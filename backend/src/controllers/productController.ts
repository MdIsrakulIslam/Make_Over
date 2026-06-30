import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    const where: any = {};

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    if (category && category !== 'All Categories') {
      // Find category by name first, since categoryId in the schema is a UUID pointing to Category model
      const categoryRecord = await prisma.category.findUnique({
        where: { name: String(category) }
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      } else {
        // If category doesn't exist in DB, return empty
        res.json([]);
        return;
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        reviews: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: true }
        }
      }
    });
    
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    
    // Upsert the category if it doesn't exist by name (mock MVP passed name as categoryId)
    const categoryName = categoryId || "Uncategorized";
    
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || "/product.png",
        categoryId: category.id
      },
      include: { category: true, reviews: true }
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const createProductReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, comment, userId } = req.body; // Expecting userId now instead of just userName for real auth
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId: id,
        userId: userId
      },
      include: { user: true }
    });
    
    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
};

export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const allReviews = await prisma.review.findMany({
      include: {
        product: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to match frontend expectations if necessary
    const formattedReviews = allReviews.map((r: any) => ({
      ...r,
      productName: r.product.name,
      userName: r.user.name,
      date: r.createdAt
    }));

    res.json(formattedReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    
    let categoryUpdate = {};
    if (categoryId) {
      const category = await prisma.category.upsert({
        where: { name: categoryId },
        update: {},
        create: { name: categoryId }
      });
      categoryUpdate = { categoryId: category.id };
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imageUrl && { imageUrl }),
        ...categoryUpdate
      },
      include: { category: true, reviews: true }
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

