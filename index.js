import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";

/*
  ======================================
  1. БАЗОВА ПЕРЕВІРКА ЗАПУСКУ
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
  2. ДАНІ КУРСУ
  Тут потім легко додати всі уроки
  ======================================
*/

const lessons = [
  {
    id: 1,
    title: "Урок 1. Парадигми: як ти бачиш себе, інших людей і світ",
    status: "open",

    content: {
      type: "placeholder",
      value: "Відео скоро буде"

      /*
        Потім можна замінити на:

        type: "youtube",
        value: "https://youtube.com/..."

        або:

        type: "telegram_video",
        value: "TELEGRAM_VIDEO_FILE_ID"

        або:

        type: "text",
        value: "Тут буде текстовий урок..."
      */
    },

    test: {
      question: "Що таке парадигма?",
      options: [
        "Спосіб, як людина бачить себе, інших людей і світ",
        "Просто звичка вставати рано",
        "Список цілей на день"
      ],
      correctIndex: 0,
      explanation:
        "Парадигма — це спосіб, як людина бачить себе, інших людей і світ. Вона впливає на твої рішення, реакції та ставлення до ситуацій."
    }
  },
  {
    id: 2,
    title: "Урок 2. Звичка 1: будь проактивним",
    status: "locked"
  },
  {
    id: 3,
    title: "Урок 3. Звичка 2: починай з кінцевої мети",
    status: "locked"
  },
  {
    id: 4,
    title: "Урок 4. Звичка 3: спочатку роби найважливіше",
    status: "locked"
  },
  {
    id: 5,
    title: "Урок 5. Звичка 4: думай “виграв-виграв”",
    status: "locked"
  },
  {
    id: 6,
    title: "Урок 6. Звичка 5: спочатку зрозумій, потім будь зрозумілим",
    status: "locked"
  },
  {
    id: 7,
    title: "Урок 7. Звички 6–7: синергія і заточування пилки",
    status: "locked"
  }
];

/*
  ======================================
  3. ДОПОМІЖНІ ФУНКЦІЇ
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

Бот не зламався повністю. Спробуй натиснути /start або повернутися до курсу.`
      );
    } catch (sendError) {
      console.error("❌ Не вдалося навіть відправити повідомлення про помилку:", sendError.message);
    }
  }
}

function findLessonById(lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId);
}

/*
  ======================================
  4. КНОПКИ
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

function lessonsKeyboard() {
  return {
    inline_keyboard: lessons.map((lesson) => {
      if (lesson.status === "open") {
        return [
          {
            text: `✅ ${lesson.title}`,
            callback_data: `lesson_open_${lesson.id}`
          }
        ];
      }

      return [
        {
          text: `🔒 ${lesson.title} — скоро буде`,
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

/*
  ======================================
  5. ЕКРАНИ БОТА
  ======================================
*/

async function showStart(chatId) {
  await safeAction("showStart", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `👋 Привіт!

Це бот для курсу “7 звичок високоефективних підлітків”.

Тут ти зможеш:
— проходити уроки;
— дивитися відео або текстові матеріали;
— проходити короткі тести;
— поступово відкривати нові теми.

Зараз готовий базовий каркас бота.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
}

async function showCourse(chatId) {
  await safeAction("showCourse", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `📚 Курс: “7 звичок підлітків”

Зараз доступний тільки перший урок.
Інші уроки поки закриті й будуть додані пізніше.`,
      {
        reply_markup: lessonsKeyboard()
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

    if (lesson.status !== "open") {
      await bot.sendMessage(chatId, "🔒 Цей урок поки закритий. Скоро буде.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    await bot.sendMessage(chatId, `📌 ${lesson.title}`);

    await sendLessonContent(chatId, lesson);

    await bot.sendMessage(
      chatId,
      `Коли будеш готовий — натисни кнопку нижче й пройди короткий тест 👇`,
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

${content.value}`
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

async function showTest(chatId, lessonId) {
  await safeAction("showTest", chatId, async () => {
    const lesson = findLessonById(lessonId);

    if (!lesson) {
      await bot.sendMessage(chatId, "❌ Урок не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!lesson.test) {
      await bot.sendMessage(chatId, "❌ Тест для цього уроку поки недоступний.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    const keyboard = lesson.test.options.map((option, index) => {
      return [
        {
          text: option,
          callback_data: `answer_${lesson.id}_${index}`
        }
      ];
    });

    await bot.sendMessage(
      chatId,
      `🧠 Тест

${lesson.test.question}`,
      {
        reply_markup: {
          inline_keyboard: keyboard
        }
      }
    );
  });
}

async function checkAnswer(chatId, lessonId, answerIndex) {
  await safeAction("checkAnswer", chatId, async () => {
    const lesson = findLessonById(lessonId);

    if (!lesson || !lesson.test) {
      await bot.sendMessage(chatId, "❌ Тест не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    const isCorrect = answerIndex === lesson.test.correctIndex;

    const resultText = isCorrect ? "✅ Правильно!" : "❌ Неправильно.";

    await bot.sendMessage(
      chatId,
      `${resultText}

${lesson.test.explanation}`,
      {
        reply_markup: continueKeyboard()
      }
    );
  });
}

async function botCheck(chatId) {
  await safeAction("botCheck", chatId, async () => {
    await bot.sendMessage(
      chatId,
      `🧪 Перевірка бота

✅ Бот працює
✅ Кнопки працюють
✅ Callback-запити обробляються
✅ Уроки завантажені: ${lessons.length}
✅ Відкритих уроків: ${lessons.filter((lesson) => lesson.status === "open").length}
✅ Закритих уроків: ${lessons.filter((lesson) => lesson.status === "locked").length}

Якщо ти бачиш це повідомлення — базова система працює нормально.`,
      {
        reply_markup: mainMenuKeyboard()
      }
    );
  });
}

/*
  ======================================
  6. КОМАНДИ
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
  7. ОБРОБКА КНОПОК
  Кожна кнопка окремо, щоб одна помилка не ламала все
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
      await bot.sendMessage(chatId, "🔒 Цей урок поки закритий. Скоро буде.", {
        reply_markup: continueKeyboard()
      });
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
    const answerIndex = Number(parts[2]);

    await checkAnswer(chatId, lessonId, answerIndex);
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
  8. ЗАХИСТ ВІД ЗВИЧАЙНИХ ПОВІДОМЛЕНЬ
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
  9. ОБРОБКА ПОМИЛОК
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
  10. ПІДТВЕРДЖЕННЯ ЗАПУСКУ
  ======================================
*/

console.log("✅ Бот запущений...");
console.log("📌 Напиши /start у Telegram");
console.log("📌 Для перевірки можна написати /check");