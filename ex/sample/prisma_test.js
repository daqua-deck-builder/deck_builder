import {PrismaClient} from '@prisma/client'

(async () => {
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany()
    console.log(users);
})();