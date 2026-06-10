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
  try {
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('ℹ️ Таблиці User ще немає, пропускаємо очищення');
  }

  // 2. Створюємо тестових користувачів (Адміністратор та Клієнт)
  console.log('👥 Додавання користувачів...');
  try {
    await prisma.user.create({
      data: {
        email: 'admin@gastrofast.com',
        name: 'Андрій (Адмін)',
        passwordHash: 'hashed_password_admin123', // Фікс назви поля
        phone: '+380501112233', // Додано обов'язкове поле
        role: 'ADMIN',
      },
    });

    await prisma.user.create({
      data: {
        email: 'client@gmail.com',
        name: 'Марія (Клієнт)',
        passwordHash: 'hashed_password_client123', // Фікс назви поля
        phone: '+380669998877', // Додано обов'язкове поле
        role: 'CLIENT',
      },
    });
  } catch (e) {
    console.log('❌ Не вдалося створити користувачів:', e);
  }

  // --- РЕСТОРАН 1: Піцерія Bella Italia ---
  console.log('🍕 Додавання піцерії Bella Italia...');
  await prisma.restaurant.create({
    data: {
      name: 'Піцерія Bella Italia',
      description: 'Справжня італійська піца на дровах у Полтаві',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      dishes: {
        create: [
          {
            name: 'Піца Капрічоза',
            description: 'Томати, моцарела, шинка, гриби',
            price: 190.0,
            image:
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
          },
          {
            name: 'Піца Маргарита',
            description:
              'Класична піца з томатами, свіжою моцарелою та базиліком',
            price: 150.0,
            image:
              'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300',
          },
          {
            name: 'Піца Чотири Сири',
            description:
              'Ніжне поєднання моцарели, пармезану, горгонзоли та чеддеру',
            price: 240.0,
            image:
              'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
          },
          {
            name: 'Салат Цезар з куркою',
            description:
              'Соковите куряче філе, листя романо, соус цезар, крутони, пармезан',
            price: 165.0,
            image:
              'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300',
          },
          {
            name: 'Тірамісу',
            description:
              'Класичний італійський десерт на основі сиру маскарпоне та кави',
            price: 110.0,
            image:
              'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
          },
        ],
      },
    },
  });

  // --- РЕСТОРАН 2: Burger Club ---
  console.log('🍔 Додавання бургерної Burger Club...');
  await prisma.restaurant.create({
    data: {
      name: 'Burger Club',
      description: 'Соковиті бургери та хрустка картопля фрі',
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      dishes: {
        create: [
          {
            name: 'Бургер Класичний',
            description:
              'Яловича котлета, сир чеддер, авторський соус, листя салату',
            price: 140.0,
            image:
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
          },
          {
            name: 'Картопля Фрі',
            description:
              'Хрустка картопля з морською сіллю та томатним кетчупом',
            price: 60.0,
            image:
              'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300',
          },
          {
            name: 'Бургер BBQ з беконом',
            description:
              'Котлета на грилі, хрусткий бекон, карамелізована цибуля, соус BBQ',
            price: 175.0,
            image:
              'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300',
          },
          {
            name: 'Цибулеві кільця',
            description:
              'Хрусткі цибулеві кільця у паніровці з ніжно-гострим соусом',
            price: 75.0,
            image:
              'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=300',
          },
          {
            name: 'Мілкшейк Ванільний',
            description:
              'Густий молочний коктейль із натуральним ванільним морозивом',
            price: 80.0,
            image:
              'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300',
          },
        ],
      },
    },
  });

  // --- РЕСТОРАН 3: Mama Pizza ---
  console.log('🍕 Додавання піцерії Мама Піца...');
  await prisma.restaurant.create({
    data: {
      name: 'Mama Pizza / Мама Піца',
      description:
        'Мама Піца - це мережа піцерій, яка пропонує широкий вибір смачних піц та комплексних комбо.',
      image:
        'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500',
      dishes: {
        create: [
          {
            name: 'Піца Тропікана (30см)',
            description:
              'Сир Моцарела, куряча грудка, тропічний ананас, вершковий соус',
            price: 210.0,
            image:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300',
          },
          {
            name: 'Чизбургер піца (30 см)',
            description:
              'Моцарела, сир чедер, яловича котлета, бекон, маринована цибулька, огірок, помідор',
            price: 295.0,
            image:
              'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300',
          },
          {
            name: 'КОМБО Мисливський +',
            description:
              'Хотдог французький, картопля фрі L, освіжаючий напій Pepsi 0.33',
            price: 155.0,
            image:
              'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=300',
          },
          {
            name: 'Курячі Нагетси (8 шт)',
            description:
              'Ніжне куряче філе у хрусткій золотистій паніровці з кисло-солодким соусом',
            price: 95.0,
            image:
              'https://images.unsplash.com/photo-1562967914-608f82629710?w=300',
          },
          {
            name: 'Лимонад Домашній',
            description:
              'Освіжаючий напій з натурального лимонного соку, м’яти та льоду',
            price: 55.0,
            image:
              'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300',
          },
        ],
      },
    },
  });

  // --- РЕСТОРАН 4: KFC ---
  console.log('🍗 Додавання KFC...');
  await prisma.restaurant.create({
    data: {
      name: 'KFC',
      description:
        'Легендарна хрустка курочка за секретним рецептом полковника Сандерса.',
      image:
        'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500',
      dishes: {
        create: [
          {
            name: 'ГРАНДЕР БУРГЕР МЕНЮ',
            description:
              'Грандер Бургер, Фрі Стандарт, Напій на вибір. Меню для великого апетиту.',
            price: 372.0,
            image:
              'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=300',
          },
          {
            name: 'БАКЕТ 8 НIЖОК',
            description:
              '8 соковитих курячих ніжок у паніровці. Класика, яка ніколи не підводить',
            price: 472.0,
            image:
              'https://images.unsplash.com/photo-1614398751058-eb2e0bf63e51?w=300',
          },
          {
            name: 'Твістер Класичний',
            description:
              'Шматочки курячого філе, томати, салат та майонезний соус, загорнуті в пшеничний коржик',
            price: 125.0,
            image:
              'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=300',
          },
          {
            name: 'Гострі Курячі Крильця (5 шт)',
            description:
              'Фірмові паніровані гострі крильця, від яких стає спекотно',
            price: 135.0,
            image:
              'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300',
          },
          {
            name: 'Пиріжк Яблучний',
            description:
              'Гарячий хрусткий пиріжок солодким яблучним наповненням та корицею',
            price: 65.0,
            image:
              'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=300',
          },
        ],
      },
    },
  });

  // --- РЕСТОРАН 5: СУШІ СТУДІЯ "Sakura" (НОВИЙ) ---
  console.log('🍣 Додавання суші-студії Sakura...');
  await prisma.restaurant.create({
    data: {
      name: 'Суші Студія Sakura',
      description:
        'Свіжі роли, преміальний лосось та традиційні страви японської кухні',
      image:
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
      dishes: {
        create: [
          {
            name: 'Рол Філадельфія Класик',
            description: 'Лосось, ніжний крем-сир, свіжий огірок, рис, норі',
            price: 260.0,
            image:
              'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300',
          },
          {
            name: 'Рол Каліфорнія з крабом',
            description:
              'Сніжний краб, авокадо, огірок, японський майонез, ікра тобіко',
            price: 195.0,
            image:
              'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300',
          },
          {
            name: 'Суп Рамен з куркою',
            description:
              'Наваристий бульйон, пшенична локшина, мариноване яйце, зелена цибуля, курка',
            price: 180.0,
            image:
              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
          },
          {
            name: 'Зелений Дракон',
            description:
              'Вугор, крем-сир, огірок, загорнутий скибочками стиглого авокадо та политий соусом унагі',
            price: 310.0,
            image:
              'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300',
          },
          {
            name: 'Салат Чука',
            description:
              'Мариновані водорості вакаме з кунжутним насінням та горіховим соусом',
            price: 90.0,
            image:
              'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300',
          },
        ],
      },
    },
  });

  // --- РЕСТОРАН 6: КАВ\'ЯРНЯ "Lviv Croissants" (НОВИЙ) ---
  console.log("🥐 Додавання кав'ярні Lviv Croissants...");
  await prisma.restaurant.create({
    data: {
      name: 'Lviv Croissants / Львівські Круасани',
      description:
        'Великі свіжоспечені круасани із ситними м’ясними та солодкими начинками',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      dishes: {
        create: [
          {
            name: 'Круасан з лососем та крем-сиром',
            description:
              'Слабосолений лосось, ніжний сир, листя салату, свіжий огірок',
            price: 145.0,
            image:
              'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300',
          },
          {
            name: 'Круасан Львівський (М’ясний)',
            description:
              'Шинка, сир тостерний, свіжий томат, листя салату, гірчичний соус',
            price: 98.0,
            image:
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
          },
          {
            name: 'Круасан з шоколадом та бананом',
            description:
              'Теплий хрусткий круасан з шоколадним топінгом та шматочками банана',
            price: 85.0,
            image:
              'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=300',
          },
          {
            name: 'Капучино Великий',
            description:
              'Класична кава з густою молочною пінкою з відбірних зерен арабіки',
            price: 60.0,
            image:
              'https://images.unsplash.com/photo-1534778101976-62847782c213?w=300',
          },
          {
            name: 'Какао з маршмеллоу',
            description:
              'Солодкий шоколадний напій з маленькими повітряними зефірками',
            price: 65.0,
            image:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
          },
        ],
      },
    },
  });

  console.log(
    '🎉 Базу даних успішно наповнено ресторанами та стравами (6 ресторанів по 5 страв)!',
  );
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час заповнення бази даних:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
