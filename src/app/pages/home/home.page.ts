import { Component, Injector } from '@angular/core';
// Importing bootstrap "node_modules/bootstrap/dist/css/bootstrap.min.css"
              
enum Page {
  INTRODUCTION,
  DISCUSS,
  CHALLENGE,
  ADVICE
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  Page = Page;
  chat: string = '';
  lastRequestSent: any[];
  lastResponseReceived: any[];
  advicesToAsk = 2;
  view = Page.INTRODUCTION;
  notificationsAdivce = 0;
  notificationsChallenge = 0;
  botAskingAdviceIndex = 0;
  botAskingChallengeIndex = 0;

  myAdvices: string[] = [];
  myChallenges: string[] = ['aaaaa aaa aa'];

  constructor() {
  }

  ngOnInit() {
    this.initLocalStorage();
  }

  initLocalStorage() {
    this.notificationsAdivce = +localStorage.getItem('notificationsAdivce') || 0;
    this.notificationsChallenge = +localStorage.getItem('notificationsChallenge') || 0;
    this.myAdvices = JSON.parse(localStorage.getItem('myAdvices')) || [];
    this.myChallenges = JSON.parse(localStorage.getItem('myChallenges')) || [];
  }

  saveAllToLocalStorage() {
    localStorage.setItem('notificationsAdivce', String(this.notificationsAdivce));
    localStorage.setItem('notificationsChallenge', String(this.notificationsChallenge));
    localStorage.setItem('myAdvices', JSON.stringify(this.myAdvices));
    localStorage.setItem('myChallenges', JSON.stringify(this.myChallenges));
  }

  dfMessengerInit() {
    this.lastRequestSent = [];
    this.lastResponseReceived = [];
    this.setMessengerStyle();
    this.subscribeToMessengerEvents();
  }

  setMessengerStyle() {
    const dfMessenger: any = document.querySelector('df-messenger').shadowRoot;
    const messagesList = dfMessenger.querySelector('df-messenger-chat').shadowRoot.querySelector('df-message-list').shadowRoot;
    const bgElement = <HTMLElement>messagesList.querySelector('.message-list-wrapper');
    console.log('bgElement', bgElement);
    bgElement.style.background = 'url("assets/images/psy.jpg") no-repeat center center fixed';
    bgElement.style.height = '100%';
    bgElement.style.overflow = 'hidden';
    bgElement.style['background-size'] = 'cover';

    
    const icon = <HTMLElement>dfMessenger.querySelector('#widgetIcon');
    console.log('icon', icon);
    icon.style.display = 'none';
  }

  subscribeToMessengerEvents() {
    let _this = this;

    const dfMessenger = document.querySelector('df-messenger');
    dfMessenger.addEventListener('df-response-received', function (event: any) {
      const clone = JSON.parse(JSON.stringify(event.detail.response));
      _this.lastResponseReceived.push(clone);
      console.log('_this.lastResponseReceived', this);
      _this.handleResponse(clone);
    });

    dfMessenger.addEventListener('df-request-sent', function (event: any) {
      const clone = JSON.parse(JSON.stringify(event.detail.requestBody));
      _this.lastRequestSent.push(clone);
      console.log('_this.lastRequestSent', _this.lastRequestSent);
    });

    dfMessenger.addEventListener('df-button-clicked', function (event: any) {
      console.log('button event');
      _this.chat = '';
      _this.setView(Page.DISCUSS);
    });
  }


  handleResponse(response) {
    if (response && response.queryResult && response.queryResult.action) {
      const fulfillmentMessages = response.queryResult.fulfillmentMessages as Array<any>;

      fulfillmentMessages.forEach(message => {
        if(message && message.payload && message.payload.advice) {
          const advice = this.lastRequestSent[this.botAskingAdviceIndex + 1].queryInput.text.text;
          this.myAdvices.push(advice);
          this.notificationsAdivce++;
          this.saveAllToLocalStorage();
        } else if(message && message.payload && message.payload.challenge) {
          const challenge = this.lastRequestSent[this.botAskingChallengeIndex + 1].queryInput.text.text;
          this.myChallenges.push(challenge);
          this.notificationsChallenge++;
          this.saveAllToLocalStorage();
        } else if(message && message.payload && message.payload.askingAdvice) {
          this.botAskingAdviceIndex = this.lastResponseReceived.length - 1;
        } else if(message && message.payload && message.payload.askingChallenge) {
          this.botAskingChallengeIndex = this.lastResponseReceived.length - 1;
        }
      });
    }
  }

  initMessengerWhenOpened() {
    const messenger = document.querySelector('df-messenger');
    if(messenger) {
      console.log('messenger',messenger)
      this.dfMessengerInit();
    } else {
      setTimeout(() => this.dfMessengerInit(), 100);

    }
  }

  startChat(chatType: string) {
    this.chat = '';
    setTimeout(() => {
      this.chat = chatType;
      this.initMessengerWhenOpened();
    }, 100);
  }

  setView(page: Page) {
    if(page === Page.ADVICE) {
      this.notificationsAdivce = 0;
      this.saveAllToLocalStorage();
    } else if(page === Page.CHALLENGE) {
      this.notificationsChallenge = 0;
      this.saveAllToLocalStorage();
    }

    this.scrollToTop();
    this.view = page;
  }

  scrollToTop() {
    var mainCard = document.getElementById('mainCard');
    mainCard.scrollTop = 0;
  }
}
