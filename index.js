import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";

/*
  ======================================
  1. ЗАПУСК БОТА
  ======================================
*/

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN не знайдено в .env");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("⏳ Запускаю Telegram-бота...");
console.log("✅ BOT_TOKEN знайдено");
console.log("✅ Polling увімкнено");

/*
  ======================================
  2. ПРОГРЕС КОРИСТУВАЧІВ БЕЗ БАЗИ ДАНИХ

  Важливо:
  це зберігається тільки поки бот запущений.
  Якщо перезапустити бота — прогрес обнулиться.
  Пізніше можна буде замінити на базу даних.
  ======================================
*/

const userProgress = new Map();

function getUserProgress(chatId) {
  if (!userProgress.has(chatId)) {
    userProgress.set(chatId, {
      unlockedLessonId: 0,
      answers: {},
      scores: {}
    });
  }

  return userProgress.get(chatId);
}

/*
  ======================================
  3. УРОКИ КУРСУ

  id: 0 — вступ
  id: 1–7 — 7 звичок
  ======================================
*/

const lessons = [
  {
    id: 0,
    title: "Вступ. Парадигми: як ти бачиш себе, інших людей і світ",
    shortTitle: "Вступ: Парадигми",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що таке парадигма?",
          options: [
            "Спосіб, як людина бачить себе, інших людей і світ",
            "Просто звичка вставати рано",
            "Список цілей на день"
          ],
          correctIndex: 0,
          explanation:
            "Парадигма — це спосіб бачення. Вона впливає на те, як людина розуміє себе, інших людей і світ."
        },
        {
          question: "Чому парадигми важливі перед вивченням звичок?",
          options: [
            "Бо вони впливають на наші рішення і реакції",
            "Бо це просто красива назва",
            "Бо вони замінюють усі звички"
          ],
          correctIndex: 0,
          explanation:
            "Перед зміною поведінки важливо зрозуміти, як ти бачиш ситуацію. Часто саме погляд на ситуацію керує реакцією."
        },
        {
          question: "Що може змінитися, якщо змінюється парадигма?",
          options: [
            "Ставлення до себе, людей і проблем",
            "Тільки колір одягу",
            "Тільки погода"
          ],
          correctIndex: 0,
          explanation:
            "Коли змінюється погляд, може змінитися ставлення, вибір і поведінка."
        },
        {
          question: "Яка фраза найкраще описує парадигму?",
          options: [
            "Це лінза, через яку я дивлюся на світ",
            "Це домашнє завдання",
            "Це список покупок"
          ],
          correctIndex: 0,
          explanation:
            "Парадигму можна уявити як лінзу: вона не завжди змінює реальність, але змінює те, як ми її бачимо."
        }
      ]
    }
  },
  {
    id: 1,
    title: "Урок 1. Звичка 1: будь проактивним",
    shortTitle: "Звичка 1: будь проактивним",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що означає бути проактивним?",
          options: [
            "Брати відповідальність за свої реакції та вибір",
            "Завжди чекати, поки хтось вирішить за тебе",
            "Звинувачувати інших у всіх проблемах"
          ],
          correctIndex: 0,
          explanation:
            "Проактивність — це коли ти розумієш: ситуація може бути складною, але твоя реакція все одно залежить від тебе."
        },
        {
          question: "Яка фраза більше схожа на проактивну?",
          options: [
            "Я подумаю, що можу зробити зараз",
            "У мене нічого не вийде, бо всі проти мене",
            "Це не моя проблема взагалі"
          ],
          correctIndex: 0,
          explanation:
            "Проактивна людина шукає, що залежить від неї, замість того щоб одразу здаватися."
        },
        {
          question: "Що найперше може контролювати людина?",
          options: [
            "Свою реакцію і наступний крок",
            "Думки всіх інших людей",
            "Погоду і випадкові події"
          ],
          correctIndex: 0,
          explanation:
            "Ми не завжди контролюємо обставини, але можемо вчитися контролювати свою реакцію."
        },
        {
          question: "Що робить реактивна людина?",
          options: [
            "Автоматично реагує на емоції та зовнішні обставини",
            "Робить паузу і думає",
            "Бере відповідальність за вибір"
          ],
          correctIndex: 0,
          explanation:
            "Реактивність — це коли людина дозволяє обставинам повністю керувати її поведінкою."
        }
      ]
    }
  },
  {
    id: 2,
    title: "Урок 2. Звичка 2: починай з кінцевої мети",
    shortTitle: "Звичка 2: кінцева мета",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що означає починати з кінцевої мети?",
          options: [
            "Розуміти, до чого ти хочеш прийти",
            "Робити все випадково",
            "Ніколи не планувати"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка допомагає спочатку побачити напрям, а потім уже робити кроки."
        },
        {
          question: "Навіщо підлітку мати орієнтир?",
          options: [
            "Щоб не жити тільки на автопілоті",
            "Щоб усі рішення приймали друзі",
            "Щоб нічого не змінювати"
          ],
          correctIndex: 0,
          explanation:
            "Орієнтир допомагає краще розуміти, навіщо ти щось робиш."
        },
        {
          question: "Що може бути прикладом кінцевої мети?",
          options: [
            "Якою людиною я хочу стати",
            "Скільки повідомлень я сьогодні прогорну",
            "Скільки разів я відкладу справу"
          ],
          correctIndex: 0,
          explanation:
            "Кінцева мета — це не тільки завдання, а й образ людини, якою ти хочеш стати."
        },
        {
          question: "Що стає легше, коли є мета?",
          options: [
            "Вибирати, на що витрачати час і сили",
            "Повністю уникати всіх труднощів",
            "Ніколи не помилятися"
          ],
          correctIndex: 0,
          explanation:
            "Мета не прибирає всі проблеми, але допомагає краще обирати напрям."
        }
      ]
    }
  },
  {
    id: 3,
    title: "Урок 3. Звичка 3: спочатку роби найважливіше",
    shortTitle: "Звичка 3: найважливіше",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Про що звичка “спочатку роби найважливіше”?",
          options: [
            "Про вміння ставити головні справи вище дрібних відволікань",
            "Про те, щоб завжди робити тільки легке",
            "Про те, щоб нічого не планувати"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка вчить не просто бути зайнятим, а робити те, що справді важливо."
        },
        {
          question: "Що часто заважає робити важливе?",
          options: [
            "Відволікання, телефон, лінь і хаос",
            "Тільки погода",
            "Тільки інші міста"
          ],
          correctIndex: 0,
          explanation:
            "Найважливіші справи часто програють дрібним відволіканням, якщо їх не поставити першими."
        },
        {
          question: "Який приклад більше підходить до цієї звички?",
          options: [
            "Спочатку зробити головне завдання, потім відпочинок",
            "Спочатку 3 години гортати телефон",
            "Відкладати все до ночі"
          ],
          correctIndex: 0,
          explanation:
            "Коли головне зроблено першим, день стає спокійнішим і контрольованішим."
        },
        {
          question: "Що означає “важливе”?",
          options: [
            "Те, що наближає до цілей і розвитку",
            "Те, що просто найгучніше",
            "Те, що просить будь-хто в будь-який момент"
          ],
          correctIndex: 0,
          explanation:
            "Важливе — це не завжди термінове. Це те, що реально впливає на твоє життя."
        }
      ]
    }
  },
  {
    id: 4,
    title: "Урок 4. Звичка 4: думай “виграв-виграв”",
    shortTitle: "Звичка 4: виграв-виграв",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що означає мислення “виграв-виграв”?",
          options: [
            "Шукати рішення, де добре не тільки тобі, а й іншій людині",
            "Перемагати інших будь-якою ціною",
            "Завжди поступатися всім"
          ],
          correctIndex: 0,
          explanation:
            "Виграв-виграв — це не про слабкість і не про егоїзм. Це про чесний варіант, де враховані обидві сторони."
        },
        {
          question: "Яка поведінка НЕ схожа на “виграв-виграв”?",
          options: [
            "Я маю виграти, а інші неважливі",
            "Давай знайдемо рішення для нас обох",
            "Я хочу зрозуміти твою позицію"
          ],
          correctIndex: 0,
          explanation:
            "Якщо людина думає тільки про свою перемогу, це вже не формат “виграв-виграв”."
        },
        {
          question: "Де можна застосовувати цю звичку?",
          options: [
            "У дружбі, навчанні, командній роботі й конфліктах",
            "Тільки на уроках математики",
            "Тільки коли немає людей поруч"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка особливо корисна там, де є взаємодія з іншими людьми."
        },
        {
          question: "Що допомагає мислити “виграв-виграв”?",
          options: [
            "Повага до себе і до іншої людини",
            "Бажання завжди довести, що ти кращий",
            "Ігнорування чужої думки"
          ],
          correctIndex: 0,
          explanation:
            "Повага до себе й інших допомагає шукати рішення без приниження або тиску."
        }
      ]
    }
  },
  {
    id: 5,
    title: "Урок 5. Звичка 5: спочатку зрозумій, потім будь зрозумілим",
    shortTitle: "Звичка 5: спочатку зрозумій",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Про що ця звичка?",
          options: [
            "Спочатку уважно слухати, а потім пояснювати себе",
            "Перебивати, щоб швидше сказати своє",
            "Не слухати, якщо не згоден"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка вчить справді чути людину, а не просто чекати своєї черги говорити."
        },
        {
          question: "Що часто робить спілкування гіршим?",
          options: [
            "Коли людина слухає тільки для того, щоб відповісти",
            "Коли людина ставить уточнювальні питання",
            "Коли людина намагається зрозуміти"
          ],
          correctIndex: 0,
          explanation:
            "Якщо ми слухаємо тільки для відповіді, ми можемо не зрозуміти справжній сенс слів іншої людини."
        },
        {
          question: "Яка фраза показує бажання зрозуміти?",
          options: [
            "Я правильно зрозумів, що ти маєш на увазі...?",
            "Та я і так усе знаю",
            "Мені байдуже, що ти думаєш"
          ],
          correctIndex: 0,
          explanation:
            "Уточнення допомагає показати, що ти не просто чуєш слова, а намагаєшся зрозуміти людину."
        },
        {
          question: "Чому важливо спочатку зрозуміти?",
          options: [
            "Бо тоді інша людина частіше готова почути тебе",
            "Бо тоді можна взагалі не говорити",
            "Бо так можна швидше перемогти в суперечці"
          ],
          correctIndex: 0,
          explanation:
            "Коли людина відчуває, що її почули, діалог стає набагато спокійнішим і чеснішим."
        }
      ]
    }
  },
  {
    id: 6,
    title: "Урок 6. Звичка 6: створюй синергію",
    shortTitle: "Звичка 6: синергія",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що таке синергія?",
          options: [
            "Коли разом можна створити кращий результат, ніж окремо",
            "Коли всі думають абсолютно однаково",
            "Коли кожен працює тільки сам"
          ],
          correctIndex: 0,
          explanation:
            "Синергія — це коли різні сильні сторони людей поєднуються і дають сильніший результат."
        },
        {
          question: "Що допомагає синергії?",
          options: [
            "Повага до різних ідей",
            "Висміювання чужих думок",
            "Бажання усе контролювати самому"
          ],
          correctIndex: 0,
          explanation:
            "Синергія з’являється там, де люди не знищують різність, а використовують її як силу."
        },
        {
          question: "Де може бути синергія?",
          options: [
            "У командному проєкті, дружбі, навчанні або сім’ї",
            "Тільки в комп’ютерних іграх",
            "Тільки коли ти один"
          ],
          correctIndex: 0,
          explanation:
            "Синергія з’являється у взаємодії, коли люди шукають спільний сильний результат."
        },
        {
          question: "Яка думка найближча до синергії?",
          options: [
            "Твоя ідея плюс моя ідея можуть дати щось краще",
            "Є тільки моя правильна думка",
            "Краще нікого не слухати"
          ],
          correctIndex: 0,
          explanation:
            "Синергія — це не просто компроміс. Це пошук кращого рішення через поєднання різних поглядів."
        }
      ]
    }
  },
  {
    id: 7,
    title: "Урок 7. Звичка 7: заточуй пилку",
    shortTitle: "Звичка 7: заточуй пилку",
    content: {
      type: "placeholder",
      value: "Відео скоро буде"
    },
    test: {
      questions: [
        {
          question: "Що означає “заточуй пилку”?",
          options: [
            "Регулярно відновлювати свої сили й розвивати себе",
            "Працювати без відпочинку",
            "Забути про здоров’я"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка про відновлення і розвиток: тіло, розум, емоції та внутрішній стан."
        },
        {
          question: "Чому відновлення важливе?",
          options: [
            "Бо без нього людина швидше виснажується",
            "Бо відпочинок завжди заважає",
            "Бо розвиток не потребує сил"
          ],
          correctIndex: 0,
          explanation:
            "Якщо не відновлювати сили, навіть хороші звички стає важко підтримувати."
        },
        {
          question: "Що може бути прикладом “заточування пилки”?",
          options: [
            "Сон, рух, навчання, спокій і час для себе",
            "Постійно сидіти в телефоні до ночі",
            "Ігнорувати втому"
          ],
          correctIndex: 0,
          explanation:
            "Ця звичка про баланс: не тільки працювати, а й оновлювати свої ресурси."
        },
        {
          question: "Яка сфера теж потребує відновлення?",
          options: [
            "Емоції та внутрішній стан",
            "Тільки заряд телефону",
            "Тільки одяг"
          ],
          correctIndex: 0,
          explanation:
            "Людині важливо дбати не тільки про тіло, а й про емоції, думки та внутрішню опору."
        }
      ]
    }
  }
];

/*
  ======================================
  4. ЛОГИ І БЕЗПЕКА
  ======================================
*/

function logStep(step, chatId, extra = "") {
  console.log(`✅ [${step}] chatId=${chatId} ${extra}`);
}

function logError(step, error) {
  console.error(`❌ [${step}]`, error.message);
}

async function safeAction(stepName, chatId, action) {
  try {
    logStep(`${stepName}: start`, chatId);
    await action();
    logStep(`${stepName}: success`, chatId);
  } catch (error) {
    logError(stepName, error);

    try {
      await bot.sendMessage(
        chatId,
        `⚠️ Сталася технічна помилка в блоці: ${stepName}

Бот не зламався повністю. Натисни /start, щоб повернутися в меню.`
      );
    } catch (sendError) {
      console.error("❌ Не вдалося відправити повідомлення про помилку:", sendError.message);
    }
  }
}

function findLessonById(lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId);
}

function isLessonUnlocked(chatId, lessonId) {
  const progress = getUserProgress(chatId);
  return lessonId <= progress.unlockedLessonId;
}

function unlockNextLesson(chatId, currentLessonId) {
  const progress = getUserProgress(chatId);
  const nextLessonId = currentLessonId + 1;

  if (nextLessonId < lessons.length && nextLessonId > progress.unlockedLessonId) {
    progress.unlockedLessonId = nextLessonId;
  }
}

/*
  ======================================
  5. КНОПКИ
  ======================================
*/

function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🚀 Почати курс", callback_data: "course_open" }],
      [{ text: "🧪 Перевірити бота", callback_data: "bot_check" }]
    ]
  };
}

function lessonsKeyboard(chatId) {
  return {
    inline_keyboard: lessons.map((lesson) => {
      const unlocked = isLessonUnlocked(chatId, lesson.id);

      if (unlocked) {
        return [
          {
            text: `✅ ${lesson.shortTitle}`,
            callback_data: `lesson_open_${lesson.id}`
          }
        ];
      }

      return [
        {
          text: `🔒 ${lesson.shortTitle} — закрито`,
          callback_data: `lesson_locked_${lesson.id}`
        }
      ];
    })
  };
}

function lessonKeyboard(lessonId) {
  return {
    inline_keyboard: [
      [{ text: "🧠 Пройти тест", callback_data: `test_open_${lessonId}` }],
      [{ text: "📚 До списку уроків", callback_data: "course_open" }],
      [{ text: "🏠 Головне меню", callback_data: "main_menu" }]
    ]
  };
}

function continueKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "➡️ Продовжити курс", callback_data: "course_open" }],
      [{ text: "🏠 Головне меню", callback_data: "main_menu" }]
    ]
  };
}

function retryLessonKeyboard(lessonId) {
  return {
    inline_keyboard: [
      [{ text: "🔁 Передивитися урок", callback_data: `lesson_open_${lessonId}` }],
      [{ text: "🧠 Пройти тест ще раз", callback_data: `test_open_${lessonId}` }],
      [{ text: "📚 До списку уроків", callback_data: "course_open" }]
    ]
  };
}

/*
  ======================================
  6. ЕКРАНИ
  ======================================
*/

async function showStart(chatId) {
  await safeAction("showStart", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `👋 Привіт!

Це бот для курсу за мотивами книги Шона Кові “7 звичок високоефективних підлітків”.

Структура курсу:

0. Вступ: парадигми
1. Будь проактивним
2. Починай з кінцевої мети
3. Спочатку роби найважливіше
4. Думай “виграв-виграв”
5. Спочатку зрозумій, потім будь зрозумілим
6. Створюй синергію
7. Заточуй пилку

Після кожного уроку буде тест із 4 питань.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
}

async function showCourse(chatId) {
  await safeAction("showCourse", chatId, async () => {
    const progress = getUserProgress(chatId);

    await bot.sendMessage(
      chatId,
      `📚 Курс: “7 звичок підлітків”

Відкрито до уроку: ${progress.unlockedLessonId} із 7.

Щоб відкрити наступний урок, пройди тест:
— 0–2/4: краще передивитися урок;
— 3/4: можна йти далі, але краще повторити;
— 4/4: ідеально, наступний урок відкривається.`,
      {
        reply_markup: lessonsKeyboard(chatId)
      }
    );
  });
}

async function showLesson(chatId, lessonId) {
  await safeAction("showLesson", chatId, async () => {
    const lesson = findLessonById(lessonId);

    if (!lesson) {
      await bot.sendMessage(chatId, "❌ Урок не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!isLessonUnlocked(chatId, lessonId)) {
      await bot.sendMessage(
        chatId,
        `🔒 Цей урок поки закритий.

Спочатку пройди попередній урок і тест.`,
        {
          reply_markup: continueKeyboard()
        }
      );
      return;
    }

    await bot.sendMessage(chatId, `📌 ${lesson.title}`);

    await sendLessonContent(chatId, lesson);

    await bot.sendMessage(
      chatId,
      `Коли будеш готовий — натисни кнопку нижче й пройди тест із 4 питань 👇`,
      {
        reply_markup: lessonKeyboard(lesson.id)
      }
    );
  });
}

async function sendLessonContent(chatId, lesson) {
  const content = lesson.content;

  if (!content) {
    await bot.sendMessage(chatId, "🎬 Матеріал уроку скоро буде.");
    return;
  }

  if (content.type === "placeholder") {
    await bot.sendMessage(
      chatId,
      `🎬 Відео уроку

${content.value}

Тут потім можна буде вставити:
— YouTube-посилання;
— Telegram video file_id;
— або текстовий урок.`
    );
    return;
  }

  if (content.type === "youtube") {
    await bot.sendMessage(
      chatId,
      `🎬 Відео уроку:

${content.value}`
    );
    return;
  }

  if (content.type === "telegram_video") {
    await bot.sendVideo(chatId, content.value, {
      caption: "🎬 Відео уроку"
    });
    return;
  }

  if (content.type === "text") {
    await bot.sendMessage(
      chatId,
      `📖 Текстовий урок:

${content.value}`
    );
    return;
  }

  await bot.sendMessage(chatId, "🎬 Матеріал уроку скоро буде.");
}

/*
  ======================================
  7. ТЕСТ
  ======================================
*/

async function showTest(chatId, lessonId) {
  await safeAction("showTest", chatId, async () => {
    const lesson = findLessonById(lessonId);

    if (!lesson) {
      await bot.sendMessage(chatId, "❌ Урок не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!isLessonUnlocked(chatId, lessonId)) {
      await bot.sendMessage(chatId, "🔒 Тест поки закритий. Спочатку відкрий урок.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!lesson.test || !lesson.test.questions.length) {
      await bot.sendMessage(chatId, "❌ Тест для цього уроку поки недоступний.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    const progress = getUserProgress(chatId);

    progress.answers[lessonId] = {
      currentQuestionIndex: 0,
      correctCount: 0
    };

    await sendQuestion(chatId, lessonId);
  });
}

async function sendQuestion(chatId, lessonId) {
  const lesson = findLessonById(lessonId);
  const progress = getUserProgress(chatId);
  const testState = progress.answers[lessonId];

  if (!lesson || !testState) {
    await bot.sendMessage(chatId, "❌ Помилка тесту. Натисни /start.");
    return;
  }

  const questionIndex = testState.currentQuestionIndex;
  const question = lesson.test.questions[questionIndex];

  if (!question) {
    await finishTest(chatId, lessonId);
    return;
  }

  const keyboard = question.options.map((option, optionIndex) => {
    return [
      {
        text: option,
        callback_data: `answer_${lessonId}_${questionIndex}_${optionIndex}`
      }
    ];
  });

  await bot.sendMessage(
    chatId,
    `🧠 Питання ${questionIndex + 1}/4

${question.question}`,
    {
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );
}

async function checkAnswer(chatId, lessonId, questionIndex, answerIndex) {
  await safeAction("checkAnswer", chatId, async () => {
    const lesson = findLessonById(lessonId);
    const progress = getUserProgress(chatId);
    const testState = progress.answers[lessonId];

    if (!lesson || !testState) {
      await bot.sendMessage(chatId, "❌ Тест не знайдено. Почни тест ще раз.", {
        reply_markup: lessonKeyboard(lessonId)
      });
      return;
    }

    const question = lesson.test.questions[questionIndex];

    if (!question) {
      await finishTest(chatId, lessonId);
      return;
    }

    const isCorrect = answerIndex === question.correctIndex;

    if (isCorrect) {
      testState.correctCount += 1;
    }

    await bot.sendMessage(
      chatId,
      `${isCorrect ? "✅ Правильно!" : "❌ Неправильно."}

${question.explanation}`
    );

    testState.currentQuestionIndex += 1;

    if (testState.currentQuestionIndex >= lesson.test.questions.length) {
      await finishTest(chatId, lessonId);
    } else {
      await sendQuestion(chatId, lessonId);
    }
  });
}

async function finishTest(chatId, lessonId) {
  const lesson = findLessonById(lessonId);
  const progress = getUserProgress(chatId);
  const testState = progress.answers[lessonId];

  if (!lesson || !testState) {
    await bot.sendMessage(chatId, "❌ Не вдалося завершити тест.", {
      reply_markup: continueKeyboard()
    });
    return;
  }

  const score = testState.correctCount;
  progress.scores[lessonId] = score;

  let message = "";

  if (score <= 2) {
    message = `📊 Результат: ${score}/4

Краще передивитися урок ще раз.

Це нормально: головне не просто натиснути правильні відповіді, а реально зрозуміти ідею.`;
  }

  if (score === 3) {
    unlockNextLesson(chatId, lessonId);

    message = `📊 Результат: ${score}/4

Добре! Наступний урок відкрито.

Але якщо хочеш краще закріпити тему, можеш передивитися відео і спробувати отримати 4/4.`;
  }

  if (score === 4) {
    unlockNextLesson(chatId, lessonId);

    message = `📊 Результат: ${score}/4

🔥 Ідеально! Ти добре зрозумів цей урок.

Наступний урок відкрито. Можеш продовжувати курс.`;
  }

  const isLastLesson = lessonId === lessons.length - 1;

  if (isLastLesson && score >= 3) {
    message += `

🎉 Це був останній урок курсу. Ти дійшов до фіналу!`;
  }

  const keyboard = score <= 2 ? retryLessonKeyboard(lessonId) : continueKeyboard();

  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/*
  ======================================
  8. ПЕРЕВІРКА БОТА
  ======================================
*/

async function botCheck(chatId) {
  await safeAction("botCheck", chatId, async () => {
    const progress = getUserProgress(chatId);

    await bot.sendMessage(
      chatId,
      `🧪 Перевірка бота

✅ Бот працює
✅ Кнопки працюють
✅ Уроки завантажені: ${lessons.length}
✅ Поточний відкритий урок: ${progress.unlockedLessonId}
✅ Тести по 4 питання
✅ Прогрес зберігається під час роботи бота

Якщо ти бачиш це повідомлення — базова система працює нормально.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
}

/*
  ======================================
  9. КОМАНДИ
  ======================================
*/

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await showStart(chatId);
});

bot.onText(/\/check/, async (msg) => {
  const chatId = msg.chat.id;
  await botCheck(chatId);
});

/*
  ======================================
  10. КНОПКИ
  ======================================
*/

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("❌ answerCallbackQuery error:", error.message);
  }

  console.log(`🔘 Натиснута кнопка: ${data} | chatId=${chatId}`);

  if (data === "main_menu") {
    await showStart(chatId);
    return;
  }

  if (data === "course_open") {
    await showCourse(chatId);
    return;
  }

  if (data === "bot_check") {
    await botCheck(chatId);
    return;
  }

  if (data.startsWith("lesson_open_")) {
    const lessonId = Number(data.replace("lesson_open_", ""));
    await showLesson(chatId, lessonId);
    return;
  }

  if (data.startsWith("lesson_locked_")) {
    await safeAction("lockedLesson", chatId, async () => {
      await bot.sendMessage(
        chatId,
        `🔒 Цей урок поки закритий.

Щоб відкрити його, спочатку пройди попередній урок і тест мінімум на 3/4.`,
        {
          reply_markup: continueKeyboard()
        }
      );
    });
    return;
  }

  if (data.startsWith("test_open_")) {
    const lessonId = Number(data.replace("test_open_", ""));
    await showTest(chatId, lessonId);
    return;
  }

  if (data.startsWith("answer_")) {
    const parts = data.split("_");

    const lessonId = Number(parts[1]);
    const questionIndex = Number(parts[2]);
    const answerIndex = Number(parts[3]);

    await checkAnswer(chatId, lessonId, questionIndex, answerIndex);
    return;
  }

  await safeAction("unknownCallback", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `⚠️ Невідома кнопка: ${data}

Повертаю тебе в головне меню.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
});

/*
  ======================================
  11. ЗВИЧАЙНІ ПОВІДОМЛЕННЯ
  ======================================
*/

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;
  if (text.startsWith("/start")) return;
  if (text.startsWith("/check")) return;

  await safeAction("unknownMessage", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `Я поки розумію тільки команди та кнопки.

Натисни /start, щоб відкрити меню.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
});

/*
  ======================================
  12. ПОМИЛКИ
  ======================================
*/

bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("❌ uncaughtException:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ unhandledRejection:", reason);
});

/*
  ======================================
  13. ГОТОВО
  ======================================
*/

console.log("✅ Бот запущений...");
console.log("📌 Напиши /start у Telegram");
console.log("📌 Для перевірки можна написати /check");