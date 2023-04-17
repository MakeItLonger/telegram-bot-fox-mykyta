const TelegramAPI = require('node-telegram-bot-api');

// const express = require('express');
// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// const token = '5996933740:AAFI7r5WTXdljEABkbnZxoWRPYBRVo9ryJU';
const tokenTest = '6047223613:AAG-Tl6tAZ_fMylILOnG71F_AqA50t1uJWY';

const bot = new TelegramAPI(tokenTest, { polling: true });

bot.setMyCommands([
  { command: '/digest', description: 'Короткий опис останньої зустрічі' },
  { command: '/poll', description: 'Дефолтне щотижневе опитування' },
  { command: '/quiz', description: 'Загальний квіз по Діям (1-4 розділи)' }
])

let quizID;
let pollMsgID;
// const chatID = '-1001887610786';
const chatIDTest = '-1001746865137';
let messageID;
let currentCorrectAnswer;

const lastDigest = 'https://t.me/c/1588797053/16';
const digestChannel = 'https://t.me/+hv39AdBv7zc4ZTgy';


let answers = {};
let isQuizLaunched = false;
let isPollLaunched = false;

const questionsQuiz = [
  'Хто є автором книги Дії Св. Апостолів?',
  'Оберіть НЕправильне ствердження про Царство Боже',
  'Ісус перед вознесінням наказує учням нічого не робити, доки...',
  'Скільки разів Євангелія говорять про перебування учнів у молитві? (до подій в Діях Св. Апостолів)',
  'Оберіть НЕправильне ствердження про Духа Святого',
  'Як Петро користується нагодою, що із-за сходження Духа Святого на апостолів біля горниці зібралось багато людей?',
  'Як називали перших християн?',
  'Оберіть НЕправильне ствердження про дії першої церкви?',
  'Кому належать ці слова: „Господь ваш Бог дасть вам Пророка, такого як я, з ваших власних людей. Ви мусите слухатися всього, що Він казатиме.”?',
  'З якою першою проблемою зіткнулась перша церква?'];
const optionsQuiz = [
  ['Матвій', 'Марк', 'Лука', 'Іван', 'Жодний з них'],
  ['Приходить так, що його всі побачать', 'Не їжа та не пиття', 'Туди ввійде лише той, хто родиться від води та Духа', 'Радість та мир у Святому Дусі', 'Всі ствердження - правильні'],
  ['Ісус не прийде вдруге', 'Не оберуть апостола замість Юди', 'Не полишать всі свої гріхи', 'Дух Святий не зійде на них'],
  ['15', '10', '7', 'Ніколи'],
  ['Отримуємо після прощення гріхів на основі покаяння', 'Дається нам на певний час в житті', 'Допомагає в боротьбі з гріхом', 'Завдяки Йому знаємо що ми Христові', 'Всі варіанти - правильні'],
  ['Співає псалом', 'Збирає з них десятини', 'Свариться із-за звинувачень у вживанні алкоголю', 'Проповідує Христа, щоб придбати їх для Царства Божого'],
  ['Учні', 'Студенти', 'Свідки Ісуса', 'Обрані'],
  ['Вивчали Слово Боже', 'Приймали участь у хліболаманні', 'Перебували у братерській спільноті', 'Молились', 'Всі ствердження - правильні'],
  ['Петру', 'Мойсеєві', 'Ілії', 'Єлисею'],
  ['Гріх в середині церкви', 'Єретичне вчення', 'Супротив влади', 'Культурні відмінності']];
const correctAnswersQuiz = [2, 0, 3, 3, 1, 3, 0, 4, 1, 2];

const prayerEncouragements = [
  'Якщо хтось із вас потрапив в біду, нехай молиться\\. І молитва з вірою спасе недужого, й Господь зцілить його\\. Якщо він вчинив гріх, то Господь пробачить йому\\. \\(Якова 5:13,15\\)',
  'І якщо матимете ви віру і не сумніватиметесь, то воно неодмінно збудеться\\. Ось чому Я й кажу вам\: чого б не просили ви у молитві, вірте, що ви все це вже одержали, й тоді усе це стане вашим\\. \\(Марка 11:24\\)',
  'Ні про що не турбуйтеся\\. За будь\\-яких обставин, через молитву прохайте Господа про що потребуєте, та завжди дякуйте Йому за все, що маєте\\. І мир, який йде від Бога, що вище людського розуміння, буде стерегти серця ваші та думки в Христі Ісусі\\. \\(Флп\\. 4:6,7\\)',
  'І ще істинно кажу вам\: якщо двоє з вас тут на землі погодяться про щось і молитимуться про це, хоч би що то було, воно буде здійснене для них Отцем Моїм Небесним\\. \\(Матвія 18\:19\\)',
  'І якщо ми знаємо, що Всевишній чує нас, то хоч би про що ми просили, неодмінно одержимо від Нього\\. \\(Перше Івана 5\:15\\)',
  'Так само й Дух приходить нам на допомогу, коли ми безсилі\\. Ми навіть не знаємо, за що маємо молитися, та Дух Сам заступається за нас перед Богом з таким зітханням, що словами й не вимовиш\\. \\(Рим 8\:26\\)',
  'У скруті я до Господа звертався, Господь на мене зглянувся і врятував\\. \\(Пс\\. 118\:5\\)',
  'Погляд Господа звернений на тих, хто добро чинить, а слух Його — до їхніх молитв\\. \\(Перше Петра 3\:12\\)',
  'Отже, коли ви, лихі й недобрі люди, знаєте, як зробити добрий дарунок дітям своїм, то наскільки ж вірніше те, що Отець Небесний обдарує Духом Святим усіх, хто просить\\! \\(Луки 11\:13\\)',
  'Отож завжди сповідуйте один одному гріхи, які ви чините, і моліться одне за одного, щоб зцілитися\\. Бог зглянеться на вас, бо молитва праведників може дуже багато\\. \\(Якова 5\:16\\)'
];

function getRandomNumber() {
    return Math.floor(Math.random() * 10);
  }

bot.on('new_chat_members', (msg) => {
  const newMembers = msg.new_chat_members
  const newMembersArr = newMembers.map((member) => {
    const tagName = member.username ? '@' + member.username : null;
    return tagName ?? member.first_name;
  });

  const stringMembers = newMembersArr.join(', ');


  bot.sendMessage(chatIDTest, `Раді вітати тебе, ${stringMembers}! Господь цінить твоє бажання вивчати Боже Слово. Загальну інформацію ти можеш знайти в описі групи. Якщо тобі потрібна моя допомога, користуйся командами в правому нижньому куті чату - [/] або набирай руцями '/'`);
})



bot.on('poll_answer', ({ poll_id, user, option_ids: [answer] }) => {
  const tagName = user.username ? '@' + user.username : null;
  const fullName = user.first_name && user.last_name ? user.first_name + ' ' + user.last_name : null;
  const username = tagName ?? fullName ?? user.first_name;
  if (poll_id === quizID) {
    if (currentCorrectAnswer === answer) {
      if (answers[username]) {
        answers[username][0] = answers[username][0] + 1;
        answers[username][1] = answers[username][1] + 1;
      } else {
        answers[username] = [1, 1];
      }
    } else {
      if (!answers[username]) {
        answers[username] = [0, 1];
      } else {
        answers[username][1] = answers[username][1] + 1;
      }
    }
  }
});

bot.on('message', async (msg) => {
  const text = msg.text ? msg.text : null;
  const userID = msg.from.id;
  const chatID = msg.chat.id;
  const messageID = msg.message_id;
  const tagName = msg.from.username ?? null;
  const fullName = msg.from.first_name && msg.from.last_name ? msg.from.first_name + ' ' + msg.from.last_name : null;
  const username = tagName ?? fullName ?? msg.from.first_name;
  //const channelID = -1001588797053;
  if (text && text.toLowerCase().startsWith('/digest')) {
    const message = `[Короткий опис останньої зустрічі](${lastDigest})\\. Щоб посилання спрацювало  треба бути підписаним на [канал](${digestChannel})\\.`;

    bot.sendMessage(chatID, message, { parse_mode: 'MarkdownV2' });
  }



  if (text && text.toLowerCase().startsWith('/quiz') && !isQuizLaunched) {
    isQuizLaunched = true;
    let quizResults = 'Результати квізу:\n';
    let place = 0;
    let messageID;


    for (let i = 0; i < questionsQuiz.length; i++) {
        await bot.sendPoll(chatID, `${i + 1}. ${questionsQuiz[i]}`, optionsQuiz[i], {
            is_anonymous: false,
            allowsMultipleAnswers: false,
            type: 'quiz',
            open_period: 30,
            correct_option_id: correctAnswersQuiz[i]
        }).then(res => {
            isAnswered = false;
            messageID = res.message_id;
            quizID = res.poll.id;
            currentCorrectAnswer = correctAnswersQuiz[i];
        })
        await new Promise(resolve => setTimeout(resolve, 30000));
    
        await bot.deleteMessage(chatID, messageID);
    
    }


    

    const sortedAnswers = Object.fromEntries(Object.entries(answers).sort((a, b) => b[1][0] - a[1][0]));

    for (let key in sortedAnswers) {
      place++;
      quizResults += `\n${place}. ${key} - ${answers[key][0]}/${answers[key][1]} (${Math.round(answers[key][0] * 100 / answers[key][1])}%)`
    }

    bot.sendMessage(chatID, quizResults);

    answers = {};
    isQuizLaunched = false;
  } else if (text && text.toLowerCase().startsWith('/quiz') && isQuizLaunched) {
    bot.sendMessage(chatID, 'В даний момент є можливість приймати участь тільки в поточному квізі. Якщо ви хочете запустити новий квіз, дочекайтесь результатів поточного. 😌');
  }

  if (text && text.toLowerCase().startsWith('/poll') && !isPollLaunched) {
    isPollLaunched = true;
    let newStr;
    let indexOfFirstSpace;
    if (text.includes(' ')) {
      indexOfFirstSpace = text.indexOf(' ') + 1;
      newStr = text.slice(indexOfFirstSpace);
    }

    const optionsArr = !newStr ? [] : newStr.split(',');


    const [place = 'Церква Благодать', time = '19:00', date = 'в четвер'] = optionsArr.map(item => item.trim());

    const question = `Хто планує бути на дослідженні Слова ${date} о ${time}? Місце зустрічі - ${place}`;
    const options = ['Так, планую бути! 😇', 'Ні, на жаль не можу... :( 😈'];
    
    bot.sendPoll(chatID, question, options, {
      is_anonymous: false,
      allowsMultipleAnswers: false,
      type: 'regular'
    }).then(res => {
      pollMsgID = res.message_id;
      bot.pinChatMessage(chatID, pollMsgID, {disable_notification: false});
      console.log(pollMsgID);
    })
  } else if (text && text.toLowerCase().startsWith('/poll') && isPollLaunched) {
    bot.sendMessage(chatID, 'Опитування на цей тиждень вже було створене, наступного разу будьте уважніше! 😉');
  }

  if (text && text.toLowerCase().startsWith('/stop') && pollMsgID) {
    isPollLaunched = false;
    bot.deleteMessage(chatID, messageID);
    bot.stopPoll(chatID, pollMsgID);
    bot.unpinChatMessage(chatID, { message_id: pollMsgID });
  }

  // if (text && text.toLowerCase().startsWith('/pay')) {
  //     const price = [{ label: 'Ball', amount: 1000 }];
  //     const paid = JSON.stringify(price);
  //     bot.sendInvoice(chatID,'Football', 'Pay for playing Football', 'SOME_PAYLOAD', '844d0883-75b2-4be8-9778-9135ee0a372e', 'UAH', paid);
  // }
  if (text && text.toLowerCase().startsWith('/delete') && pollMsgID) {
    bot.deleteMessage(chatID, messageID);
    isPollLaunched = false;
    await bot.unpinChatMessage(chatID, { message_id: pollMsgID });
    bot.deleteMessage(chatID, pollMsgID);
  }

  if ((/прошу/i.test(text) && /молитис/i.test(text)) ||
    (/прошу/i.test(text) && /молится/i.test(text)) ||
    (/прошу/i.test(text) && /молиться/i.test(text)) ||
    (/просьба/i.test(text) && /молиться/i.test(text)) ||
    (/просьба/i.test(text) && /молится/i.test(text)) ||
    (/проси/i.test(text) && /молитис/i.test(text)) ||
    (/прохан/i.test(text) && /молитис/i.test(text)) ||
    (/моліться/i.test(text) || /молітся/i.test(text)) ||
    (/молитесь/i.test(text) || /молытесь/i.test(text))
    ) {
    const randomNumber = getRandomNumber();
    bot.sendMessage(chatID, `Давайте підтримаємо в молитві [${fullName}](tg://user?id=${userID})\\. 🙏\n\n_${prayerEncouragements[randomNumber]}_`, { parse_mode: 'MarkdownV2' });
    bot.pinChatMessage(chatID, messageID, {disable_notification: false});
  }
})