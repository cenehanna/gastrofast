import { PrismaClient } from '@prisma/client';

// Класичний чистий конструктор Prisma 5 (урл підтягнеться автоматично зі schema.prisma)
const prisma = new PrismaClient();

async function main() {
  console.log('Початок наповнення бази даних...');

  // Очищаємо старі дані перед заповненням
  await prisma.dish.deleteMany();
  await prisma.restaurant.deleteMany();

  // 1. Створюємо Ресторан 1 з його стравами
  await prisma.restaurant.create({
    data: {
      name: 'Піцерія Bella Italia',
      description: 'Справжня італійська піца на дровах у Полтаві',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      dishes: {
        create: [
          {
            name: 'Піца Капрічоза',
            description: 'Томати, моцарела, шинка, гриби',
            price: 190,
            image:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
          },
          {
            name: 'Піца Маргарита',
            description: 'Класична піца з томатами та сиром',
            price: 150,
            image:
              'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200',
          },
        ],
      },
    },
  });

  // 2. Створюємо Ресторан 2 з його стравами
  await prisma.restaurant.create({
    data: {
      name: 'Burger Club',
      description: 'Соковиті бургери та хрустка картопля фрі',
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      dishes: {
        create: [
          {
            name: 'Бургер Класичний',
            description: 'Яловича котлета, сир чеддер, авторський соус',
            price: 140,
            image:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
          },
          {
            name: 'Картопля Фрі',
            description: 'Хрустка картопля з сіллю та кетчупом',
            price: 60,
            image:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200',
          },
        ],
      },
    },
  });

  console.log('Базу даних успішно наповнено ресторанами та стравами!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
