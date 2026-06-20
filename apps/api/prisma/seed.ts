import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subcategories inherit parent's subscription price — they store 0n themselves.
// Only top-level categories have subscription prices (executors subscribe to parent).
const PARENTS: {
  nameUz: string;
  nameRu: string;
  subscriptionPriceUzs: bigint;
  sortOrder: number;
  children: { nameUz: string; nameRu: string; sortOrder: number }[];
}[] = [
  {
    nameUz: 'Usta xizmatlar',
    nameRu: 'Ремонт и строительство',
    subscriptionPriceUzs: 500000n,
    sortOrder: 1,
    children: [
      { nameUz: 'Santexnika ishlari',       nameRu: 'Сантехнические работы',          sortOrder: 1 },
      { nameUz: 'Elektr ishlari',            nameRu: 'Электромонтажные работы',        sortOrder: 2 },
      { nameUz: 'Otdelka va ta\'mirlash',    nameRu: 'Отделка и ремонт',              sortOrder: 3 },
      { nameUz: 'Tom ishlari',               nameRu: 'Кровельные работы',              sortOrder: 4 },
      { nameUz: 'Eshik va deraza',           nameRu: 'Окна и двери',                  sortOrder: 5 },
      { nameUz: 'Pol ta\'mirlash',           nameRu: 'Ремонт полов',                  sortOrder: 6 },
      { nameUz: 'Shift ta\'mirlash',         nameRu: 'Ремонт потолков',               sortOrder: 7 },
      { nameUz: 'Devor ta\'mirlash',         nameRu: 'Ремонт стен',                   sortOrder: 8 },
      { nameUz: 'Gisht va tosh ishlari',     nameRu: 'Кладка кирпича и камня',        sortOrder: 9 },
      { nameUz: 'Buzmalar ishlari',          nameRu: 'Демонтажные работы',            sortOrder: 10 },
      { nameUz: 'Poydevor ishlari',          nameRu: 'Фундамент и основание',         sortOrder: 11 },
      { nameUz: 'Uy qurilishi',              nameRu: 'Строительство дома',            sortOrder: 12 },
      { nameUz: 'Obodonlashtirish',          nameRu: 'Благоустройство и озеленение',  sortOrder: 13 },
      { nameUz: 'Dizayn interer',            nameRu: 'Дизайн интерьера',             sortOrder: 14 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Yuk tashish',
    nameRu: 'Грузоперевозки',
    subscriptionPriceUzs: 200000n,
    sortOrder: 2,
    children: [
      { nameUz: 'Yuk avtomobili',            nameRu: 'Грузовое такси',                sortOrder: 1 },
      { nameUz: 'Mebel tashish',             nameRu: 'Доставка мебели',               sortOrder: 2 },
      { nameUz: 'Texnika yetkazish',         nameRu: 'Доставка техники',              sortOrder: 3 },
      { nameUz: 'Qurilish materiallari',     nameRu: 'Доставка стройматериалов',      sortOrder: 4 },
      { nameUz: 'Shaharlararo tashish',      nameRu: 'Межгородние перевозки',         sortOrder: 5 },
      { nameUz: 'Xalqaro tashish',           nameRu: 'Международные перевозки',       sortOrder: 6 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Ko\'chish va yuk ortish',
    nameRu: 'Переезды и грузчики',
    subscriptionPriceUzs: 250000n,
    sortOrder: 3,
    children: [
      { nameUz: 'Kvartira ko\'chish',        nameRu: 'Переезд квартиры',              sortOrder: 1 },
      { nameUz: 'Ofis ko\'chish',            nameRu: 'Переезд офиса',                 sortOrder: 2 },
      { nameUz: 'Yuk ortuvchilar',           nameRu: 'Грузчики',                      sortOrder: 3 },
      { nameUz: 'Pianino va og\'ir narsalar',nameRu: 'Пианино и крупногабаритные',   sortOrder: 4 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Avto ta\'mir',
    nameRu: 'Автосервис',
    subscriptionPriceUzs: 300000n,
    sortOrder: 4,
    children: [
      { nameUz: 'Texnik xizmat ko\'rsatish', nameRu: 'Техническое обслуживание',      sortOrder: 1 },
      { nameUz: 'Dvigatel va transmissiya',  nameRu: 'Двигатель и трансмиссия',       sortOrder: 2 },
      { nameUz: 'Kuzov ta\'mirlash',         nameRu: 'Кузовной ремонт',               sortOrder: 3 },
      { nameUz: 'Avtoelektrika',             nameRu: 'Автоэлектрика',                 sortOrder: 4 },
      { nameUz: 'Konditsioner xizmati',      nameRu: 'Обслуживание кондиционера',     sortOrder: 5 },
      { nameUz: 'Avto oyna va tonirovka',    nameRu: 'Автостёкла и тонировка',        sortOrder: 6 },
      { nameUz: 'Shinomontaj',               nameRu: 'Шиномонтаж',                    sortOrder: 7 },
      { nameUz: 'Avto yuvish va deyling',    nameRu: 'Мойка и детейлинг',             sortOrder: 8 },
      { nameUz: 'Yo\'lda yordam',            nameRu: 'Помощь на дороге',              sortOrder: 9 },
      { nameUz: 'Mototsikl xizmati',         nameRu: 'Мотосервис',                    sortOrder: 10 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Tadbirlar va foto/video',
    nameRu: 'Мероприятия и фото/видео',
    subscriptionPriceUzs: 350000n,
    sortOrder: 5,
    children: [
      { nameUz: 'To\'y fotografi',           nameRu: 'Свадебная фотосъёмка',          sortOrder: 1 },
      { nameUz: 'Tadbir fotografi',          nameRu: 'Репортажная фотосъёмка',        sortOrder: 2 },
      { nameUz: 'Mahsulot fotografi',        nameRu: 'Предметная фотосъёмка',         sortOrder: 3 },
      { nameUz: 'To\'y videografi',          nameRu: 'Свадебная видеосъёмка',         sortOrder: 4 },
      { nameUz: 'Tadbir videografi',         nameRu: 'Репортажная видеосъёмка',       sortOrder: 5 },
      { nameUz: 'Dron suratga olish',        nameRu: 'Аэросъёмка (дрон)',             sortOrder: 6 },
      { nameUz: 'Video montaj',              nameRu: 'Монтаж видео',                  sortOrder: 7 },
      { nameUz: 'Foto tahrirlash',           nameRu: 'Обработка фотографий',          sortOrder: 8 },
      { nameUz: 'Tamada va olib boruvchi',   nameRu: 'Тамада и ведущий',              sortOrder: 9 },
      { nameUz: 'Animatorlar',               nameRu: 'Аниматоры',                     sortOrder: 10 },
      { nameUz: 'Bezatish va floristika',    nameRu: 'Декор и флористика',            sortOrder: 11 },
      { nameUz: 'Ovoz va yorug\'lik',        nameRu: 'Звук и свет',                   sortOrder: 12 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Huquqiy va moliyaviy',
    nameRu: 'Юридические и финансовые услуги',
    subscriptionPriceUzs: 200000n,
    sortOrder: 6,
    children: [
      { nameUz: 'Yuridik maslahat',          nameRu: 'Юридическая консультация',      sortOrder: 1 },
      { nameUz: 'Advokat xizmatlari',        nameRu: 'Услуги адвоката',               sortOrder: 2 },
      { nameUz: 'Buxgalteriya xizmatlari',   nameRu: 'Бухгалтерские услуги',          sortOrder: 3 },
      { nameUz: 'Soliq maslahat',            nameRu: 'Консультация по налогам',       sortOrder: 4 },
      { nameUz: 'Notarial xizmatlar',        nameRu: 'Нотариальные услуги',           sortOrder: 5 },
      { nameUz: 'Hujjat rasmiylashtirish',   nameRu: 'Оформление документов',         sortOrder: 6 },
      { nameUz: 'Kompaniya ro\'yxati',       nameRu: 'Регистрация и ликвидация фирм', sortOrder: 7 },
      { nameUz: 'Shartnoma tuzish',          nameRu: 'Составление договоров',         sortOrder: 8 },
      { nameUz: 'Ariza va da\'vo',           nameRu: 'Составление жалоб и исков',     sortOrder: 9 },
      { nameUz: 'Kadrlar ishlari',           nameRu: 'Кадровое делопроизводство',     sortOrder: 10 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Tozalash',
    nameRu: 'Уборка и помощь по хозяйству',
    subscriptionPriceUzs: 140000n,
    sortOrder: 7,
    children: [
      { nameUz: 'Kvartira tozalash',         nameRu: 'Уборка квартиры',               sortOrder: 1 },
      { nameUz: 'Uy tozalash',               nameRu: 'Уборка дома',                   sortOrder: 2 },
      { nameUz: 'Ofis tozalash',             nameRu: 'Уборка офиса',                  sortOrder: 3 },
      { nameUz: 'Ta\'mirdan keyin tozalash', nameRu: 'Уборка после ремонта',          sortOrder: 4 },
      { nameUz: 'Deraza yuvinish',           nameRu: 'Мытьё окон',                    sortOrder: 5 },
      { nameUz: 'Mebel kimyoviy tozalash',   nameRu: 'Химчистка мебели',              sortOrder: 6 },
      { nameUz: 'Kir yuvish va dazmollash',  nameRu: 'Стирка и глажка',               sortOrder: 7 },
      { nameUz: 'Xo\'jalik yordami',         nameRu: 'Помощь по хозяйству',           sortOrder: 8 },
      { nameUz: 'O\'simlik parvarishi',      nameRu: 'Уход за растениями',            sortOrder: 9 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Bog\'dorchilik',
    nameRu: 'Садоводство и озеленение',
    subscriptionPriceUzs: 120000n,
    sortOrder: 8,
    children: [
      { nameUz: 'Bog\' ishlari',             nameRu: 'Садовые работы',                sortOrder: 1 },
      { nameUz: 'Maysazor parvarishi',       nameRu: 'Уход за газоном',               sortOrder: 2 },
      { nameUz: 'Daraxt va buta kesish',     nameRu: 'Обрезка деревьев и кустов',     sortOrder: 3 },
      { nameUz: 'Ko\'chat o\'tkazish',       nameRu: 'Посадка растений',              sortOrder: 4 },
      { nameUz: 'Obodonlashtirish',          nameRu: 'Благоустройство участка',       sortOrder: 5 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Enaga va parvarishchi',
    nameRu: 'Уход за детьми и пожилыми',
    subscriptionPriceUzs: 100000n,
    sortOrder: 9,
    children: [
      { nameUz: 'Enaga',                     nameRu: 'Няня',                          sortOrder: 1 },
      { nameUz: 'Maktabgacha tayyorlash',    nameRu: 'Подготовка к школе/садику',     sortOrder: 2 },
      { nameUz: 'Keksalarga parvarishchi',   nameRu: 'Уход за пожилыми',              sortOrder: 3 },
      { nameUz: 'Bemorga parvarishchi',      nameRu: 'Уход за больными',              sortOrder: 4 },
      { nameUz: 'Hamroh',                    nameRu: 'Сопровождение',                 sortOrder: 5 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Kuryer',
    nameRu: 'Курьерские услуги',
    subscriptionPriceUzs: 120000n,
    sortOrder: 10,
    children: [
      { nameUz: 'Piyoda kuryer',             nameRu: 'Пеший курьер',                  sortOrder: 1 },
      { nameUz: 'Avtomobil kuryer',          nameRu: 'Курьер на авто',                sortOrder: 2 },
      { nameUz: 'Tezkor yetkazish',          nameRu: 'Срочная доставка',              sortOrder: 3 },
      { nameUz: 'Mahsulot yetkazish',        nameRu: 'Доставка продуктов',            sortOrder: 4 },
      { nameUz: 'Ovqat yetkazish',           nameRu: 'Доставка еды из ресторанов',    sortOrder: 5 },
      { nameUz: 'Hujjat yetkazish',          nameRu: 'Доставка документов',           sortOrder: 6 },
      { nameUz: 'Sotib olib keltirish',      nameRu: 'Купить и доставить',            sortOrder: 7 },
      { nameUz: 'Kunlik kuryer',             nameRu: 'Курьер на день',                sortOrder: 8 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Go\'zallik',
    nameRu: 'Красота и уход за собой',
    subscriptionPriceUzs: 140000n,
    sortOrder: 11,
    children: [
      { nameUz: 'Sartaroshlik',              nameRu: 'Парикмахерские услуги',         sortOrder: 1 },
      { nameUz: 'Manikur va pedikur',        nameRu: 'Маникюр и педикюр',             sortOrder: 2 },
      { nameUz: 'Gel lak va tirnoq uzaytirish', nameRu: 'Гель-лак и наращивание ногтей', sortOrder: 3 },
      { nameUz: 'Vizajist va makiyaj',       nameRu: 'Визажист и макияж',             sortOrder: 4 },
      { nameUz: 'Kosmetolog',                nameRu: 'Косметолог',                    sortOrder: 5 },
      { nameUz: 'Epilyatsiya va shugaring',  nameRu: 'Эпиляция и шугаринг',          sortOrder: 6 },
      { nameUz: 'Qosh va kipriklar',         nameRu: 'Брови и ресницы',               sortOrder: 7 },
      { nameUz: 'Massaj',                    nameRu: 'Массаж',                        sortOrder: 8 },
      { nameUz: 'Tatu va pirs',              nameRu: 'Тату и пирсинг',                sortOrder: 9 },
      { nameUz: 'SPA muolajalari',           nameRu: 'СПА-процедуры',                sortOrder: 10 },
      { nameUz: 'Stilist va imijmeyker',     nameRu: 'Стилист и имиджмейкер',         sortOrder: 11 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Sport va fitnes',
    nameRu: 'Спорт и фитнес',
    subscriptionPriceUzs: 120000n,
    sortOrder: 12,
    children: [
      { nameUz: 'Shaxsiy murabbiy',          nameRu: 'Персональный тренер',           sortOrder: 1 },
      { nameUz: 'Yoga va pilates',           nameRu: 'Йога и пилатес',                sortOrder: 2 },
      { nameUz: 'Boks va kurash',            nameRu: 'Бокс и борьба',                 sortOrder: 3 },
      { nameUz: 'Futbol',                    nameRu: 'Футбол',                        sortOrder: 4 },
      { nameUz: 'Suzish',                    nameRu: 'Плавание',                      sortOrder: 5 },
      { nameUz: 'Gimnastika',                nameRu: 'Гимнастика',                    sortOrder: 6 },
      { nameUz: 'Velosipedchi',              nameRu: 'Велоспорт',                     sortOrder: 7 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Repetitor',
    nameRu: 'Репетиторы и обучение',
    subscriptionPriceUzs: 80000n,
    sortOrder: 13,
    children: [
      { nameUz: 'O\'zbek tili',              nameRu: 'Узбекский язык',                sortOrder: 1 },
      { nameUz: 'Rus tili',                  nameRu: 'Русский язык',                  sortOrder: 2 },
      { nameUz: 'Ingliz tili',               nameRu: 'Английский язык',               sortOrder: 3 },
      { nameUz: 'Nemis tili',                nameRu: 'Немецкий язык',                 sortOrder: 4 },
      { nameUz: 'Fransuz tili',              nameRu: 'Французский язык',              sortOrder: 5 },
      { nameUz: 'Boshqa tillar',             nameRu: 'Другие языки',                  sortOrder: 6 },
      { nameUz: 'Matematika',                nameRu: 'Математика',                    sortOrder: 7 },
      { nameUz: 'Fizika',                    nameRu: 'Физика',                        sortOrder: 8 },
      { nameUz: 'Kimyo',                     nameRu: 'Химия',                         sortOrder: 9 },
      { nameUz: 'Biologiya',                 nameRu: 'Биология',                      sortOrder: 10 },
      { nameUz: 'Tarix',                     nameRu: 'История',                       sortOrder: 11 },
      { nameUz: 'Informatika',               nameRu: 'Информатика и программирование',sortOrder: 12 },
      { nameUz: 'Musiqa',                    nameRu: 'Музыка',                        sortOrder: 13 },
      { nameUz: 'Raqs',                      nameRu: 'Танцы',                         sortOrder: 14 },
      { nameUz: 'Rasm va san\'at',           nameRu: 'Рисование и искусство',         sortOrder: 15 },
      { nameUz: 'Logoped',                   nameRu: 'Логопед',                       sortOrder: 16 },
      { nameUz: 'Talabalarga yordam',        nameRu: 'Помощь студентам',              sortOrder: 17 },
      { nameUz: 'Avto haydash darsi',        nameRu: 'Уроки вождения',                sortOrder: 18 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Oshpaz va keytering',
    nameRu: 'Повара и кейтеринг',
    subscriptionPriceUzs: 180000n,
    sortOrder: 14,
    children: [
      { nameUz: 'To\'y oshpazi',             nameRu: 'Свадебный повар',               sortOrder: 1 },
      { nameUz: 'Palov usta',                nameRu: 'Плов-мастер',                   sortOrder: 2 },
      { nameUz: 'Uy oshpazi',                nameRu: 'Домашний повар',                sortOrder: 3 },
      { nameUz: 'Keytering xizmati',         nameRu: 'Кейтеринг',                     sortOrder: 4 },
      { nameUz: 'Tort va non-pishiriq',      nameRu: 'Торты и выпечка',               sortOrder: 5 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Kompyuter yordam',
    nameRu: 'Компьютерная помощь',
    subscriptionPriceUzs: 100000n,
    sortOrder: 15,
    children: [
      { nameUz: 'Kompyuter ta\'mirlash',     nameRu: 'Ремонт компьютера и ноутбука',  sortOrder: 1 },
      { nameUz: 'Dastur o\'rnatish',         nameRu: 'Установка и настройка программ', sortOrder: 2 },
      { nameUz: 'Internet va Wi-Fi',         nameRu: 'Настройка интернета и Wi-Fi',   sortOrder: 3 },
      { nameUz: 'Virus olib tashlash',       nameRu: 'Удаление вирусов',              sortOrder: 4 },
      { nameUz: 'Ma\'lumot tiklash',         nameRu: 'Восстановление данных',         sortOrder: 5 },
      { nameUz: 'Printer yordam',            nameRu: 'Помощь с принтером',            sortOrder: 6 },
      { nameUz: 'Telefon va planshet',       nameRu: 'Помощь с телефоном и планшетом',sortOrder: 7 },
      { nameUz: 'Tarmoq sozlash',            nameRu: 'Настройка сети',                sortOrder: 8 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Texnika ta\'miri',
    nameRu: 'Ремонт бытовой техники',
    subscriptionPriceUzs: 160000n,
    sortOrder: 16,
    children: [
      { nameUz: 'Kir yuvish mashinasi',      nameRu: 'Стиральная и сушильная машина', sortOrder: 1 },
      { nameUz: 'Sovutgich',                 nameRu: 'Холодильник и морозильник',      sortOrder: 2 },
      { nameUz: 'Konditsioner',              nameRu: 'Кондиционер и климатехника',    sortOrder: 3 },
      { nameUz: 'Gaz plita',                 nameRu: 'Газовая плита',                 sortOrder: 4 },
      { nameUz: 'Elektr plita',              nameRu: 'Электрическая плита и панель',  sortOrder: 5 },
      { nameUz: 'Duxovka',                   nameRu: 'Духовой шкаф',                  sortOrder: 6 },
      { nameUz: 'Suv isitgich va qozon',     nameRu: 'Водонагреватель и котёл',       sortOrder: 7 },
      { nameUz: 'Idish yuvish mashinasi',    nameRu: 'Посудомоечная машина',          sortOrder: 8 },
      { nameUz: 'Changuruvchi',              nameRu: 'Пылесос и очиститель воздуха',  sortOrder: 9 },
      { nameUz: 'Tikuv mashinasi',           nameRu: 'Швейная машина',                sortOrder: 10 },
      { nameUz: 'Kofe mashinasi',            nameRu: 'Кофемашина',                    sortOrder: 11 },
      { nameUz: 'Mikrotolqinli pech',        nameRu: 'Микроволновая печь',            sortOrder: 12 },
      { nameUz: 'Mayda texnika',             nameRu: 'Мелкая бытовая техника',        sortOrder: 13 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Dizayn va IT frilansi',
    nameRu: 'Дизайн и IT-услуги',
    subscriptionPriceUzs: 150000n,
    sortOrder: 17,
    children: [
      { nameUz: 'Logotip va brend',          nameRu: 'Логотип и фирменный стиль',     sortOrder: 1 },
      { nameUz: 'Veb-dizayn',                nameRu: 'Дизайн сайта',                  sortOrder: 2 },
      { nameUz: 'Ilova dizayni',             nameRu: 'Дизайн приложения',             sortOrder: 3 },
      { nameUz: 'Poligrafiya',               nameRu: 'Полиграфический дизайн',        sortOrder: 4 },
      { nameUz: 'Qadoqlash dizayni',         nameRu: 'Дизайн упаковки',               sortOrder: 5 },
      { nameUz: 'Banner va postlar',         nameRu: 'Баннеры и посты для соцсетей',  sortOrder: 6 },
      { nameUz: 'Illustratsiya',             nameRu: 'Иллюстрация',                   sortOrder: 7 },
      { nameUz: 'Veb-sayt yaratish',         nameRu: 'Разработка сайта',              sortOrder: 8 },
      { nameUz: 'Ilova yaratish',            nameRu: 'Разработка приложения',         sortOrder: 9 },
      { nameUz: 'Bot yaratish',              nameRu: 'Разработка бота (Telegram)',     sortOrder: 10 },
      { nameUz: 'SMM va ijtimoiy tarmoq',    nameRu: 'SMM и ведение соцсетей',        sortOrder: 11 },
      { nameUz: 'Kontent yaratish',          nameRu: 'Создание контента',             sortOrder: 12 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Tarjima xizmatlari',
    nameRu: 'Услуги переводчика',
    subscriptionPriceUzs: 80000n,
    sortOrder: 18,
    children: [
      { nameUz: 'O\'zbek-Rus tarjima',       nameRu: 'Узбекско-русский перевод',      sortOrder: 1 },
      { nameUz: 'O\'zbek-Ingliz tarjima',    nameRu: 'Узбекско-английский перевод',   sortOrder: 2 },
      { nameUz: 'Rus-Ingliz tarjima',        nameRu: 'Русско-английский перевод',     sortOrder: 3 },
      { nameUz: 'Hujjat tarjimasi',          nameRu: 'Перевод документов',            sortOrder: 4 },
      { nameUz: 'Og\'zaki tarjima',          nameRu: 'Устный перевод',                sortOrder: 5 },
      { nameUz: 'Boshqa tillar',             nameRu: 'Другие языки',                  sortOrder: 99 },
    ],
  },
  {
    nameUz: 'Hayvonlarga xizmat',
    nameRu: 'Уход за животными',
    subscriptionPriceUzs: 80000n,
    sortOrder: 19,
    children: [
      { nameUz: 'It va mushuk parvarishi',   nameRu: 'Уход за собаками и кошками',    sortOrder: 1 },
      { nameUz: 'Grooming',                  nameRu: 'Груминг',                       sortOrder: 2 },
      { nameUz: 'It sayr ettirish',          nameRu: 'Выгул собак',                   sortOrder: 3 },
      { nameUz: 'Uyda veterinar',            nameRu: 'Ветеринар на дому',             sortOrder: 4 },
      { nameUz: 'Hayvon mehmonxonasi',       nameRu: 'Передержка животных',           sortOrder: 5 },
      { nameUz: 'Boshqa',                    nameRu: 'Другое',                        sortOrder: 99 },
    ],
  },
];

async function main() {
  console.log('Clearing categories...');
  await prisma.category.deleteMany();

  console.log('Seeding parent categories...');
  for (const parent of PARENTS) {
    const created = await prisma.category.create({
      data: {
        nameUz: parent.nameUz,
        nameRu: parent.nameRu,
        subscriptionPriceUzs: parent.subscriptionPriceUzs,
        sortOrder: parent.sortOrder,
      },
    });

    for (const child of parent.children) {
      await prisma.category.create({
        data: {
          nameUz: child.nameUz,
          nameRu: child.nameRu,
          subscriptionPriceUzs: 0n,
          sortOrder: child.sortOrder,
          parentId: created.id,
        },
      });
    }

    console.log(`  ✓ ${parent.nameUz} (${parent.children.length} subcategories)`);
  }

  const total = await prisma.category.count();
  const parents = await prisma.category.count({ where: { parentId: null } });
  const children = await prisma.category.count({ where: { parentId: { not: null } } });
  console.log(`\n✅ Seeded ${total} total (${parents} categories, ${children} subcategories)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
