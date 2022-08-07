/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */

const {
  Telegraf, session, BaseScene, Stage,
} = require('telegraf');
const { questions } = require('./quiz');
const { text } = require('./text');
const {
  startOptions, forwardOption,
} = require('./options');
const { MyContext } = require('./context');

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN, { contextType: MyContext });

bot.use(
  session({
    getSessionKey: ({ pollAnswer, from }) => {
      // for public quizzes
      if (pollAnswer?.user.id) {
        const { id } = pollAnswer.user;
        return `${id}:${id}`;
      } if (from) return `${from.id}:${from.id}`;
      return '54567890987656';
    },
  }),
);

bot.use((ctx, next) => next(ctx));

const quizBot = new BaseScene('quizBot');
const stage = new Stage([quizBot]);

bot.use(stage.middleware());

bot.telegram.setMyCommands(
  [{ command: '/start', description: 'Bot Start' },
    { command: '/help', description: 'Help' },
    { command: '/game', description: 'Restart the game' }],
);

bot.help((ctx) => ctx.reply(text.help));

bot.command('game', async (ctx) => {
  try {
    await ctx.reply(text.help, forwardOption);
  } catch (e) {
    console.log(e);
    return ctx.reply(text.error);
  }
});

let questionIndex;
bot.context.questions = questions;
let intervalId = 0;

bot.start(async (ctx) => {
  try {
    await ctx.reply(`Hi ${ctx.from.first_name}! ${text.greeting}`, startOptions);
  } catch (e) {
    console.log(e);
    return ctx.reply(text.error);
  }
});

bot.on('callback_query', async (ctx) => {
  const { data } = ctx.callbackQuery;
  if (data === '1') {
    try {
      return ctx.reply(text.help, forwardOption);
    } catch (e) {
      console.log(e);
      return ctx.reply(text.error);
    }
  } if (data === '2') {
    try {
      return ctx.reply(text.goodbye);
    } catch (e) {
      console.log(e);
      return ctx.reply(text.error);
    }
  } if (data === 'start') {
    return ctx.scene.enter('quizBot');
  }
});

quizBot.enter(async (ctx) => {
  // start the game
  questionIndex = 0;
  const counter = 0;
  ctx.session.counter = counter;
  ctx.session.questionIndex = questionIndex;
  ctx.session.time = 20;
  const currQuestion = questions[questionIndex];
  await ctx.replyWithQuiz(currQuestion.message, ['True', 'False'], {
    correct_option_id: currQuestion.answer,
    open_period: 20,
    explanation: currQuestion.comment,
    is_anonymous: false,
  }).then((data) => {
    intervalId = setInterval(() => {
      // start counting remaining time and write in into session
      ctx.session.time--;
      if (ctx.session.time === 0) {
        clearInterval(intervalId);
        return ctx.reply(`${text.timeOut} ${text.repeat}`, startOptions);
      }
    }, 1000);
  });
});

quizBot.on('poll_answer', async (ctx) => {
  // restart remaining time and write in into session
  clearInterval(intervalId);
  questionIndex = ++ctx.session.questionIndex;
  const result = questions[questionIndex - 1].answer === ctx.pollAnswer.option_ids[0];
  result && ++ctx.session.counter;
  if (questionIndex !== questions.length) {
    const currQuestion = questions[questionIndex];
    try {
      ctx.session.time = 20;
      await ctx.replyWithQuiz(currQuestion.message, ['True', 'False'], {
        correct_option_id: currQuestion.answer,
        open_period: 20,
        explanation: currQuestion.comment,
        is_anonymous: false,
      }).then((data) => {
        intervalId = setInterval(() => {
          ctx.session.time--;
          if (ctx.session.time === 0) {
            clearInterval(intervalId);
            return ctx.reply(`${text.timeOut} ${text.repeat}`, startOptions);
          }
        }, 1000);
      });
    } catch (e) {
      console.log(e);
      return ctx.reply(text.error);
    }
  } else {
    try {
      ctx.reply(`${text.results}
  
      ✅ You were right — ${ctx.session.counter}
      ❌ You were wrong — ${10 - ctx.session.counter}
  
      ${text.repeat}`, startOptions);
      return ctx.scene.leave();
    } catch (e) {
      console.log(e);
      return ctx.reply('Error occured. Please try again later');
    }
  }
});

bot.launch();
