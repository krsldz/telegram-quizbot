const { Context } = require('telegraf');

class MyContext extends Context {
  get chat() {
    return (
      (this.message && this.message.chat)
      || (this.editedMessage && this.editedMessage.chat)
      || (this.callbackQuery && this.callbackQuery.message && this.callbackQuery.message.chat)
      || (this.channelPost && this.channelPost.chat)
      || (this.editedChannelPost && this.editedChannelPost.chat)
      || (this.pollAnswer && this.pollAnswer.user)
    );
  }

  get from() {
    return (
      (this.message && this.message.from)
      || (this.editedMessage && this.editedMessage.from)
      || (this.callbackQuery && this.callbackQuery.from)
      || (this.inlineQuery && this.inlineQuery.from)
      || (this.channelPost && this.channelPost.from)
      || (this.editedChannelPost && this.editedChannelPost.from)
      || (this.shippingQuery && this.shippingQuery.from)
      || (this.preCheckoutQuery && this.preCheckoutQuery.from)
      || (this.chosenInlineResult && this.chosenInlineResult.from)
      || (this.pollAnswer && this.pollAnswer.user)
    );
  }
}
module.exports = { MyContext };
