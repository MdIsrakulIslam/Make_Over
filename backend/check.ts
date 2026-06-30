import prisma from './src/prisma';
import bcrypt from 'bcryptjs';
import "dotenv/config";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@makeover.com' } });
  console.log("USER IN DB:", user);
  if (user) {
    const isValid = await bcrypt.compare('password123', user.password);
    console.log("PASSWORD VALID FOR password123:", isValid);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
