import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'dobbit';
  const password = 'dobbit1234';

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert test user
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
      nickname: '테스트 계정',
    },
  });

  console.log('Seeded user:', {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
