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
    textLesson: `Парадигма — це спосіб, як людина бачить себе, інших людей і світ.

Це ніби внутрішня лінза. Через неї ти дивишся на події, людей, проблеми, свої можливості й навіть на самого себе.

Наприклад, двоє підлітків можуть отримати однакову критику. Один подумає: “Я невдаха, у мене нічого не вийде”. Інший подумає: “Мені неприємно, але я можу зрозуміти, що покращити”. Подія однакова, але парадигма різна.

Саме тому перед вивченням 7 звичок важливо зрозуміти: твої дії часто починаються не з дії, а з погляду. Якщо ти бачиш себе слабким, безпорадним або “таким, що нічого не може”, ти частіше здаєшся. Якщо ти бачиш себе людиною, яка може вчитися, змінюватися і робити хоча б один крок, тоді з’являється рух.

Парадигми можуть допомагати або заважати. Обмежувальна парадигма каже: “Я завжди все провалюю”. Сильніша парадигма каже: “Я можу помилятися, але я можу вчитися”.

Курс про 7 звичок починається саме з цього: спочатку треба навчитися помічати, як ти дивишся на себе і світ.

Головна думка:
якщо змінюється погляд, може змінитися реакція. Якщо змінюється реакція, поступово змінюється поведінка. А поведінка формує життя.`,
    test: {
      questions: [
        {
          question: "Що таке парадигма?",
          options: [
            "Просто список справ на день",
            "Спосіб, як людина бачить себе, інших людей і світ",
            "Звичка вставати дуже рано"
          ],
          correctIndex: 1,
          explanation:
            "Парадигма — це спосіб бачення. Вона впливає на те, як людина розуміє себе, інших людей і ситуації."
        },
        {
          question: "Чому парадигми важливі перед вивченням звичок?",
          options: [
            "Бо вони впливають на рішення, реакції та поведінку",
            "Бо вони повністю замінюють усі звички",
            "Бо це просто складне слово без значення"
          ],
          correctIndex: 0,
          explanation:
            "Перед зміною поведінки важливо зрозуміти, як ти бачиш ситуацію. Часто саме погляд керує реакцією."
        },
        {
          question: "Який приклад найкраще описує парадигму?",
          options: [
            "Список покупок",
            "Домашнє завдання",
            "Лінза, через яку я дивлюся на світ"
          ],
          correctIndex: 2,
          explanation:
            "Парадигму можна уявити як лінзу: вона не завжди змінює реальність, але змінює те, як ми її бачимо."
        },
        {
          question: "Що може змінитися, якщо змінюється парадигма?",
          options: [
            "Тільки погода",
            "Ставлення до себе, людей і проблем",
            "Тільки назва уроку"
          ],
          correctIndex: 1,
          explanation:
            "Коли змінюється погляд, може змінитися ставлення, вибір і поведінка."
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
    textLesson: `Бути проактивним — означає розуміти, що між ситуацією і твоєю реакцією є вибір.

Ти не завжди контролюєш, що скажуть інші люди. Ти не завжди контролюєш оцінки, обставини, настрій інших або випадкові проблеми. Але ти можеш вчитися контролювати свою реакцію.

Реактивна людина живе так, ніби все залежить тільки від зовнішніх обставин. Вона каже: “Мене розізлили”, “Вони винні”, “Я нічого не можу зробити”. Проактивна людина теж може злитися або засмучуватися, але вона робить паузу і питає себе: “Що зараз залежить від мене?”

Проактивність — це не означає бути завжди спокійним або ідеальним. Це означає не віддавати керування своїм життям кожній емоції, кожному слову іншої людини або кожній проблемі.

Наприклад, тебе хтось образив. Реактивна відповідь — одразу відповісти грубо, закритися або цілий день прокручувати це в голові. Проактивна відповідь — зробити паузу, зрозуміти свої емоції і вибрати дію, яка не зробить ситуацію ще гіршою.

Головна думка:
ти не завжди вибираєш обставини, але можеш вибирати свою реакцію і наступний крок.`,
    test: {
      questions: [
        {
          question: "Що означає бути проактивним?",
          options: [
            "Завжди чекати, поки хтось вирішить за тебе",
            "Звинувачувати інших у всіх проблемах",
            "Брати відповідальність за свої реакції та вибір"
          ],
          correctIndex: 2,
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
            "Думки всіх інших людей",
            "Свою реакцію і наступний крок",
            "Погоду і випадкові події"
          ],
          correctIndex: 1,
          explanation:
            "Ми не завжди контролюємо обставини, але можемо вчитися контролювати свою реакцію."
        },
        {
          question: "Що робить реактивна людина?",
          options: [
            "Робить паузу і думає",
            "Бере відповідальність за вибір",
            "Автоматично реагує на емоції та зовнішні обставини"
          ],
          correctIndex: 2,
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
    textLesson: `Починати з кінцевої мети — означає спочатку зрозуміти, до чого ти хочеш прийти.

Багато людей живуть на автопілоті: прокинулись, школа, телефон, домашка, сон. День проходить, але не завжди зрозуміло, куди це все веде.

Ця звичка допомагає поставити собі важливе питання: “Якою людиною я хочу стати?” Не просто “що я хочу мати”, а саме “ким я хочу бути”.

Кінцева мета — це як карта. Якщо ти не знаєш напрям, тебе легко зносить чужими очікуваннями, настроєм, компанією або випадковими бажаннями.

Наприклад, якщо твоя мета — стати більш відповідальним, то ти інакше дивишся на навчання, обіцянки, режим і вибір друзів. Якщо мети немає, то будь-яка дрібниця може керувати твоїм днем.

Ця звичка не означає, що треба вже зараз знати все життя наперед. Вона означає мати орієнтир. Хоча б приблизно розуміти, яким ти хочеш бути через рік, через кілька років, у стосунках, навчанні, характері.

Головна думка:
коли ти знаєш, куди йдеш, тобі легше вибирати, на що витрачати час, сили й увагу.`,
    test: {
      questions: [
        {
          question: "Що означає починати з кінцевої мети?",
          options: [
            "Робити все випадково",
            "Розуміти, до чого ти хочеш прийти",
            "Ніколи не планувати"
          ],
          correctIndex: 1,
          explanation:
            "Ця звичка допомагає спочатку побачити напрям, а потім уже робити кроки."
        },
        {
          question: "Навіщо підлітку мати орієнтир?",
          options: [
            "Щоб усі рішення приймали друзі",
            "Щоб нічого не змінювати",
            "Щоб не жити тільки на автопілоті"
          ],
          correctIndex: 2,
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
            "Повністю уникати всіх труднощів",
            "Ніколи не помилятися",
            "Вибирати, на що витрачати час і сили"
          ],
          correctIndex: 2,
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
    textLesson: `Спочатку робити найважливіше — означає не дозволяти дрібницям керувати твоїм днем.

У кожного дня є справи, які реально рухають тебе вперед. Наприклад: навчання, тренування, підготовка до важливої роботи, розмова, яку давно відкладаєш, або дія, яка допомагає твоїй меті.

Але часто важливе програє терміновому або приємному. Телефон, відео, переписки, ігри, випадкові справи — усе це може з’їсти день, якщо не визначити головне.

Ця звичка не про те, щоб не відпочивати. Вона про порядок. Спочатку — те, що важливо. Потім — усе інше.

Наприклад, якщо спочатку зробити головне завдання, день стає легшим. Ти вже не носиш у голові постійне “треба зробити”. Якщо ж відкладати до ночі, з’являється стрес, вина і поспіх.

Найважливіше — це не завжди найгучніше. Інколи важлива справа тиха, неприємна або складна. Але саме вона дає результат.

Головна думка:
якщо ти не поставиш важливе першим, його легко витіснять дрібниці.`,
    test: {
      questions: [
        {
          question: "Про що звичка “спочатку роби найважливіше”?",
          options: [
            "Про те, щоб завжди робити тільки легке",
            "Про вміння ставити головні справи вище дрібних відволікань",
            "Про те, щоб нічого не планувати"
          ],
          correctIndex: 1,
          explanation:
            "Ця звичка вчить не просто бути зайнятим, а робити те, що справді важливо."
        },
        {
          question: "Що часто заважає робити важливе?",
          options: [
            "Тільки погода",
            "Тільки інші міста",
            "Відволікання, телефон, лінь і хаос"
          ],
          correctIndex: 2,
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
            "Те, що просто найгучніше",
            "Те, що наближає до цілей і розвитку",
            "Те, що просить будь-хто в будь-який момент"
          ],
          correctIndex: 1,
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
    textLesson: `Думати “виграв-виграв” — означає шукати рішення, де добре не тільки тобі, а й іншій людині.

Є кілька типів мислення. “Я виграв — ти програв” — це коли людина хоче перемогти будь-якою ціною. “Я програв — ти виграв” — це коли людина постійно поступається і забуває про себе. А “виграв-виграв” — це коли важлива і твоя позиція, і позиція іншої людини.

Це не означає бути слабким. І не означає завжди погоджуватися. Навпаки, для такого мислення потрібна внутрішня сила: поважати себе, але не принижувати іншого.

Наприклад, у командному проєкті один хоче зробити все швидко, а інший — якісно. Конфлікт можна перетворити на боротьбу. А можна спитати: “Як зробити так, щоб і здати вчасно, і не зіпсувати якість?”

Ця звичка дуже важлива для дружби, навчання, сім’ї, команди і будь-яких конфліктів.

Головна думка:
справжня перемога — це не коли ти просто “переміг” іншого, а коли знайдено чесне рішення для обох сторін.`,
    test: {
      questions: [
        {
          question: "Що означає мислення “виграв-виграв”?",
          options: [
            "Перемагати інших будь-якою ціною",
            "Завжди поступатися всім",
            "Шукати рішення, де добре не тільки тобі, а й іншій людині"
          ],
          correctIndex: 2,
          explanation:
            "Виграв-виграв — це не про слабкість і не про егоїзм. Це про чесний варіант, де враховані обидві сторони."
        },
        {
          question: "Яка поведінка НЕ схожа на “виграв-виграв”?",
          options: [
            "Давай знайдемо рішення для нас обох",
            "Я маю виграти, а інші неважливі",
            "Я хочу зрозуміти твою позицію"
          ],
          correctIndex: 1,
          explanation:
            "Якщо людина думає тільки про свою перемогу, це вже не формат “виграв-виграв”."
        },
        {
          question: "Де можна застосовувати цю звичку?",
          options: [
            "Тільки на уроках математики",
            "У дружбі, навчанні, командній роботі й конфліктах",
            "Тільки коли немає людей поруч"
          ],
          correctIndex: 1,
          explanation:
            "Ця звичка особливо корисна там, де є взаємодія з іншими людьми."
        },
        {
          question: "Що допомагає мислити “виграв-виграв”?",
          options: [
            "Бажання завжди довести, що ти кращий",
            "Ігнорування чужої думки",
            "Повага до себе і до іншої людини"
          ],
          correctIndex: 2,
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
    textLesson: `Спочатку зрозумій, потім будь зрозумілим — це звичка про справжнє слухання.

Часто люди слухають не для того, щоб зрозуміти. Вони слухають, щоб відповісти. Поки інша людина говорить, вони вже готують свою фразу, захищаються або хочуть довести свою правоту.

Але справжнє спілкування починається тоді, коли ти намагаєшся побачити ситуацію очима іншої людини.

Це не означає, що ти маєш з усім погоджуватися. Зрозуміти — не означає здатися. Це означає чесно почути, що людина відчуває, що вона має на увазі і чому для неї це важливо.

Наприклад, друг каже: “Ти мене ігноруєш”. Реактивна відповідь: “Та ні, ти сам винен”. Краща відповідь: “Ти відчув, що я не звертаю на тебе уваги?” Так ти не одразу захищаєшся, а спочатку уточнюєш.

Коли людина відчуває, що її почули, вона частіше готова почути і тебе.

Головна думка:
щоб тебе краще зрозуміли, спочатку спробуй по-справжньому зрозуміти іншого.`,
    test: {
      questions: [
        {
          question: "Про що ця звичка?",
          options: [
            "Перебивати, щоб швидше сказати своє",
            "Спочатку уважно слухати, а потім пояснювати себе",
            "Не слухати, якщо не згоден"
          ],
          correctIndex: 1,
          explanation:
            "Ця звичка вчить справді чути людину, а не просто чекати своєї черги говорити."
        },
        {
          question: "Що часто робить спілкування гіршим?",
          options: [
            "Коли людина ставить уточнювальні питання",
            "Коли людина намагається зрозуміти",
            "Коли людина слухає тільки для того, щоб відповісти"
          ],
          correctIndex: 2,
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
            "Бо тоді можна взагалі не говорити",
            "Бо так можна швидше перемогти в суперечці",
            "Бо тоді інша людина частіше готова почути тебе"
          ],
          correctIndex: 2,
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
    textLesson: `Синергія — це коли разом люди можуть створити кращий результат, ніж кожен окремо.

Ця звичка не означає, що всі мають думати однаково. Навпаки, синергія з’являється тоді, коли різні погляди, сильні сторони і досвід поєднуються.

Наприклад, один у команді добре придумує ідеї, інший добре організовує, третій добре пояснює, четвертий уважний до деталей. Окремо кожен може зробити щось своє. Але разом вони можуть створити сильніший результат.

Синергія неможлива там, де люди висміюють чужі думки, не слухають одне одного або хочуть усе контролювати самі.

Вона починається з поваги до різності. Ти можеш думати інакше, ніж я, але це не означає, що твоя думка непотрібна. Можливо, саме поєднання наших поглядів дасть краще рішення.

Синергія — це більше, ніж компроміс. Компроміс часто означає: кожен трохи поступився. Синергія означає: ми знайшли третій, кращий варіант.

Головна думка:
різність людей може бути не проблемою, а силою, якщо навчитися поєднувати її правильно.`,
    test: {
      questions: [
        {
          question: "Що таке синергія?",
          options: [
            "Коли всі думають абсолютно однаково",
            "Коли разом можна створити кращий результат, ніж окремо",
            "Коли кожен працює тільки сам"
          ],
          correctIndex: 1,
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
            "Тільки в комп’ютерних іграх",
            "Тільки коли ти один",
            "У командному проєкті, дружбі, навчанні або сім’ї"
          ],
          correctIndex: 2,
          explanation:
            "Синергія з’являється у взаємодії, коли люди шукають спільний сильний результат."
        },
        {
          question: "Яка думка найближча до синергії?",
          options: [
            "Є тільки моя правильна думка",
            "Твоя ідея плюс моя ідея можуть дати щось краще",
            "Краще нікого не слухати"
          ],
          correctIndex: 1,
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
    textLesson: `Заточуй пилку — означає регулярно відновлювати себе.

Уяви людину, яка пиляє дерево тупою пилкою. Вона працює все сильніше, втомлюється все більше, але результат стає гіршим. Якщо вона зупиниться і заточить пилку, робота піде легше.

Так само і з людиною. Якщо постійно тиснути на себе, не спати, не рухатися, не думати, не відпочивати і не відновлювати емоції, сили поступово закінчуються.

Ця звичка про баланс у чотирьох сферах: тіло, розум, емоції і внутрішній стан.

Тіло — це сон, рух, їжа, здоров’я.
Розум — це навчання, читання, нові ідеї.
Емоції — це спілкування, підтримка, вміння проживати почуття.
Внутрішній стан — це сенс, цінності, тиша, віра в те, що ти робиш.

Заточувати пилку — не означає лінуватися. Це означає дбати про ресурс, щоб мати сили жити, вчитися, працювати і будувати стосунки.

Головна думка:
щоб рухатися вперед довго, треба не тільки діяти, а й регулярно відновлювати себе.`,
    test: {
      questions: [
        {
          question: "Що означає “заточуй пилку”?",
          options: [
            "Працювати без відпочинку",
            "Регулярно відновлювати свої сили й розвивати себе",
            "Забути про здоров’я"
          ],
          correctIndex: 1,
          explanation:
            "Ця звичка про відновлення і розвиток: тіло, розум, емоції та внутрішній стан."
        },
        {
          question: "Чому відновлення важливе?",
          options: [
            "Бо відпочинок завжди заважає",
            "Бо розвиток не потребує сил",
            "Бо без нього людина швидше виснажується"
          ],
          correctIndex: 2,
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
            "Тільки заряд телефону",
            "Емоції та внутрішній стан",
            "Тільки одяг"
          ],
          correctIndex: 1,
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
      [{ text: "🎬 Дивитися відео", callback_data: `video_open_${lessonId}` }],
      [{ text: "📖 Читати урок", callback_data: `text_open_${lessonId}` }],
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

    await bot.sendMessage(
      chatId,
      `📌 ${lesson.title}

Обери формат проходження уроку:

🎬 Дивитися відео — відео буде додано пізніше.
📖 Читати урок — текстова версія доступна вже зараз.
🧠 Пройти тест — після ознайомлення з матеріалом.`,
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

async function sendLessonText(chatId, lesson) {
  if (!lesson.textLesson) {
    await bot.sendMessage(
      chatId,
      `📖 Текстовий урок

Матеріал скоро буде додано.

Поки можеш повернутися до уроку або пройти тест, якщо вже знаєш тему.`,
      {
        reply_markup: lessonKeyboard(lesson.id)
      }
    );
    return;
  }

  await bot.sendMessage(
    chatId,
    `📖 ${lesson.title}

${lesson.textLesson}`,
    {
      reply_markup: lessonKeyboard(lesson.id)
    }
  );
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

  if (data.startsWith("video_open_")) {
  const lessonId = Number(data.replace("video_open_", ""));
  const lesson = findLessonById(lessonId);

  await safeAction("videoOpen", chatId, async () => {
    if (!lesson) {
      await bot.sendMessage(chatId, "❌ Урок не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!isLessonUnlocked(chatId, lessonId)) {
      await bot.sendMessage(chatId, "🔒 Це відео поки закрите.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    await sendLessonContent(chatId, lesson);
  });

  return;
}

if (data.startsWith("text_open_")) {
  const lessonId = Number(data.replace("text_open_", ""));
  const lesson = findLessonById(lessonId);

  await safeAction("textOpen", chatId, async () => {
    if (!lesson) {
      await bot.sendMessage(chatId, "❌ Урок не знайдено.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    if (!isLessonUnlocked(chatId, lessonId)) {
      await bot.sendMessage(chatId, "🔒 Цей текстовий урок поки закритий.", {
        reply_markup: continueKeyboard()
      });
      return;
    }

    await sendLessonText(chatId, lesson);
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