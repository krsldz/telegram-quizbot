module.exports = {
  startOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Yes', callback_data: '1' },
          { text: 'Next time', callback_data: '2' }],
      ],
    }),
  },

  forwardOption: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Let\'s start!', callback_data: 'start' }],
      ],
    }),
  },

};
