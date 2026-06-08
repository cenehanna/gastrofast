import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Початок наповнення бази даних...');

  // 1. Очищаємо старі дані у правильному порядку з перевіркою на існування таблиць
  console.log('🧹 Очищення старих записів...');

  try {
    await prisma.orderItem.deleteMany();
  } catch (e) {
    console.log('ℹ️ Таблиці OrderItem ще немає, пропускаємо очищення');
  }
  try {
    await prisma.order.deleteMany();
  } catch (e) {
    console.log('ℹ️ Таблиці Order ще немає, пропускаємо очищення');
  }
  try {
    await prisma.dish.deleteMany();
  } catch (e) {
    console.log('ℹ️ Таблиці Dish ще немає, пропускаємо очищення');
  }
  try {
    await prisma.restaurant.deleteMany();
  } catch (e) {
    console.log('ℹ️ Таблиці Restaurant ще немає, пропускаємо очищення');
  }

  // 2. Створюємо Ресторан 1 з його стравами
  console.log('🍕 Додавання піцерії...');
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
            price: 190.0,
            image:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
          },
          {
            name: 'Піца Маргарита',
            description: 'Класична піца з томатами та сиром',
            price: 150.0,
            image:
              'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200',
          },
        ],
      },
    },
  });

  // 3. Створюємо Ресторан 2 з його стравами
  console.log('🍔 Додавання бургерної...');
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
            price: 140.0,
            image:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
          },
          {
            name: 'Картопля Фрі',
            description: 'Хрустка картопля з сіллю та кетчупом',
            price: 60.0,
            image:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200',
          },
        ],
      },
    },
  });

  console.log('🎉 Базу даних успішно наповнено ресторанами та стравами!');
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час заповнення бази даних:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
