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

const token = '5996933740:AAFI7r5WTXdljEABkbnZxoWRPYBRVo9ryJU';

const bot = new TelegramAPI(token, { polling: true });

bot.setMyCommands([
  { command: '/digest', description: 'Короткий опис останньої зустрічі' },
  { command: '/poll', description: 'Дефолтне щотижневе опитування' },
  { command: '/quiz', description: 'Квіз по останньому заняттю' }
])

let pollID;
const chatID = '-1001746865137';
let messageID;
let currentCorrectAnswer;

const lastDigest = 'https://t.me/c/1588797053/11';
const digestChannel = 'https://t.me/+hv39AdBv7zc4ZTgy';

let answers = {};

const questionsQuiz = [
  'Чи відмовились апостоли повністю від всіх традицій пов\'язаних із Законом?',
  'Кого Петро та Іван зустріли у воріт храму?',
  'Що відбувалось між апостолами та кульгавим коли вони тільки-но зустрілись?',
  'Як називались ворота храму біля яких сидів кульгавий?',
  'Що дав Петро кульгавому?',
  'Завдяки кому/чому сталось зцілення?',
  'Кого звільнили юдеї під час свята Пасхи за давнім звичаєм?',
  'Хто є винним в смерті Ісуса Христа?',
  'Хто/що завжди звіщало майбутній прихід Христа?',
  'В якій частині храму зібрались люди, щоб послухати проповідь?'];
const optionsQuiz = [
  ['Так. Христос скасував Закон і все, що там написано немає значення.', 'Ні. Вони зберегли в серці традиції та звички, які продовжували їх духовно забагачувати'],
  ['Кульгавого', 'Сліпого', 'Прокаженого', 'Хворого на COVID-19'],
  ['Молились', 'Сповідувались', 'Знайомились', 'Дивились один на одного'],
  ['Файні', 'Добрі', 'Гарні', 'Червоні'],
  ['Срібло', 'Золото', 'Біблію', 'Зцілення'],
  ['Благочестю Петра', 'Благочестю Івана', 'Вірі кульгавого', 'Господу'],
  ['Душогубця', 'Засновника життя'],
  ['Люди в храмі, яких звинувачував Петро', 'Ті, які безпосередньо голосували за звільнення Варавви', 'Всі евреї', 'Всі люди'],
  ['Царі та судді', 'Фарисеї та садукеї', 'Закон та Пророки', 'Адам та Єва'],
  ['Коридор Аврама', 'Ґанок Соломона', 'Стіна Давида', 'Купол Йосипа']];
const correctAnswersQuiz = [1, 0, 3, 2, 3, 3, 0, 3, 2, 1];

bot.on('new_chat_members', (msg) => {
  const newMembers = msg.new_chat_members
  console.log(msg)
  const newMembersArr = newMembers.map((member) => {
    const tagName = member.username ? '@' + member.username : null;
    return tagName ?? member.first_name;
  });

  const stringMembers = newMembersArr.join(', ');


  bot.sendMessage(chatID, `Раді вітати тебе, ${stringMembers}! Господь цінить твоє бажання вивчати Боже Слово. Загальну інформацію ти можеш знайти в описі групи. Якщо тобі потрібна моя допомога, користуйся командами в правому нижньому куті чату - [/] або набирай руцями '/'`);
})



bot.on('poll_answer', ({ poll_id, user, option_ids: [answer] }) => {
  const tagName = user.username ? '@' + user.username : null;
  const fullName = user.first_name && user.last_name ? user.first_name + ' ' + user.last_name : null;
  const username = tagName ?? fullName ?? user.first_name;
  if (poll_id === pollID) {
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
  const chatID = msg.chat.id;
  //const channelID = -1001588797053;
  if (text && text.toLowerCase().startsWith('/digest')) {
    const message = `[Короткий опис останньої зустрічі](${lastDigest})\\. Щоб посилання спрацювало  треба бути підписаним на [канал](${digestChannel})\\.`;

    bot.sendMessage(chatID, message, { parse_mode: 'MarkdownV2' });
  }



  if (text && text.toLowerCase().startsWith('/quiz')) {

    let quizResults = 'Результати квізу:\n';
    let place = 0;

    for (let i = 0; i < questionsQuiz.length; i++) {
      await bot.sendPoll(chatID, `${i + 1}. ${questionsQuiz[i]}`, optionsQuiz[i], {
        is_anonymous: false,
        allowsMultipleAnswers: false,
        type: 'quiz',
        open_period: 25,
        correct_option_id: correctAnswersQuiz[i]
      }).then(res => {
        isAnswered = false;
        messageID = res.message_id;
        pollID = res.poll.id;
        currentCorrectAnswer = correctAnswersQuiz[i];
      })
      await new Promise(resolve => setTimeout(resolve, 25000));

      await bot.deleteMessage(chatID, messageID);

    }

    const sortedAnswers = Object.fromEntries(Object.entries(answers).sort((a, b) => b[1][0] - a[1][0]));

    for (let key in sortedAnswers) {
      place++;
      quizResults += `\n${place}. ${key} - ${answers[key][0]}/${answers[key][1]} (${Math.round(answers[key][0] * 100 / answers[key][1])}%)`
    }

    bot.sendMessage(chatID, quizResults);

    answers = {};
  }

  if (text && text.toLowerCase().startsWith('/poll')) {
    let newStr;
    let indexOfFirstSpace;
    if (text.includes(' ')) {
      indexOfFirstSpace = text.indexOf(' ') + 1;
      newStr = text.slice(indexOfFirstSpace);
    }

    const optionsArr = !newStr ? [] : newStr.split(',');


    const [place = 'Церква Благодать', time = '19:00', date = 'в четвер'] = optionsArr.map(item => item.trim());

    const question = `Хто планує бути на дослідженні Слова ${date} о ${time}? Місце зустрічі - ${place}`;
    const options = ['Так, планую бути!! 😇', 'Ні, на жаль не можу... :( 😈'];

    bot.sendPoll(chatID, question, options, {
      is_anonymous: false,
      allowsMultipleAnswers: false,
      type: 'regular'
    })
  }
})