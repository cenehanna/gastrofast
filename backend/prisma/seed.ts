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
 await prisma.restaurant.create({
   data: {
     name: 'Mama Pizza / Мама Піца',
     description: 'Мама Піца - це мережа піцерій, яка пропонує широкий вибір смачних піц та інших страв. Вони відомі своїм якісним обслуговуванням та смачними рецептами, які задовольнять навіть найвибагливіших гурманів.',
     image: 'images/mama.webp',
     dishes: {
       create: [
         {
           name: 'Піца Тропікана (30см)',
           description: 'Сир Моцарела, куряча грудка, ананас, соус на вибір',
           price: 210.0,
           image: 'images/tropicana.png',
         },
         {
           name: 'Чизбургер піца (30 см)',
           description:
             'Моцарела, сир, чедер, яловича котлета для бургера, бекон, цибулька маринована, солоний огірок, помідор.',
           price: 295.0,
           image: 'images/chizburgerpiza.png',
         },
         {
           name: 'КОМБО Мисливський +',
           description:
             'Хотдог французький, з мисливською сосискою - 1 шт., картопля фрі L - 1 шт., напій Pepsi 0,33 - 1 шт.',
           price: 155.0,
           image: 'images/kombo.jpg',
         },
       ],
     },
   },
 });

await prisma.restaurant.create({
  data: {
    name: 'KFC',
    description:
      'З детальною інформацією про продукцію KFC Україна можна ознайомитись на сайті kfc.ua у розділах «Інгрідієнти», «Алергени» та «Харчова цінність». Підтверджуючи замовлення, ви погоджуєтесь з загальними умовами користування.',
    image: 'images/kfc.webp',
    dishes: {
      create: [
        {
          name: 'ГРАНДЕР БУРГЕР МЕНЮ',
          description: 'Грандер Бургер, Фрі Стандарт, Напій. Меню, яке втамує навіть грандіозний апетит.',
          price: 372.0,
          image: 'images/grandburger.webp',
        },
        {
          name: 'БАКЕТ 8 НIЖОК',
          description:
            '8 курячих ніжок. Соковите цільне м’ясо, хрустка скоринка — класика, яка ніколи не підводить | 672 Г | 116,928 Г ПРОТЕЇНУ | 1630,9 ККАЛ',
          price: 472.0,
          image: 'images/backet.webp',
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
