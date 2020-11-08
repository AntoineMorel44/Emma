import { Component, Injector } from '@angular/core';
// Importing bootstrap "node_modules/bootstrap/dist/css/bootstrap.min.css"
              

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  chat: string = '';
  advicesToAsk = 2;
  introduction = true;

  constructor() {
  }

  ngOnInit() {
    // setTimeout(() => this.dfMessengerInit(), 3000);


  }

  dfMessengerInit() {
    this.setMessengerStyle();
    this.subscribeToMessengerEvents();
  }

  setMessengerStyle() {
    const dfMessenger: any = document.querySelector('df-messenger');
    const messagesList = dfMessenger.shadowRoot.querySelector('df-messenger-chat').shadowRoot.querySelector('df-message-list').shadowRoot;
    const bgElement = <HTMLElement>messagesList.querySelector('.message-list-wrapper');
    console.log('bgElement', bgElement);
    bgElement.style.background = 'url("assets/images/psy.jpg") no-repeat center center fixed';
    bgElement.style.height = '100%';
    bgElement.style.overflow = 'hidden';
    bgElement.style['background-size'] = 'cover';
  }

  subscribeToMessengerEvents() {
    const dfMessenger = document.querySelector('df-messenger');
    let _this = this;
    dfMessenger.addEventListener('df-response-received', function (event) {
      console.log('getting event', event);
      _this.handleResponse(event);
    });
  }

  handleResponse(event) {
    if (this.chat === 'discussion') {
      this.handleDiscussionResponse(event);
    }
  }

  handleDiscussionResponse(event) {
    const response = event.detail.response;
    if (response && response.queryResult && response.queryResult.action) {
      const action = response.queryResult.action;
      if (action === '"FallBackIntent.FallBackIntent-fallback.FallBackIntent-fallback-fallback.Conseil-fallback.Noterconseil-yes"' || action === '"FallBackIntent.FallBackIntent-fallback.FallBackIntent-fallback-fallback.Conseil-fallback.Noterconseil-no"') {
        if (this.advicesToAsk > 0) {
          this.advicesToAsk--;
        } else {

        }
      }
    }
  }

  startChat(chatType: string) {
    this.chat = '';
    setTimeout(() => this.chat = chatType, 100);
    setTimeout(() => this.dfMessengerInit(), 3000);
  }

  skipIntroduction() {
    this.introduction = false;
  }
}
