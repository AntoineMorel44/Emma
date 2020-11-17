import { Component, Injector } from '@angular/core';
import * as moment from 'moment';
// Importing bootstrap "node_modules/bootstrap/dist/css/bootstrap.min.css"

enum Page {
  INTRODUCTION,
  DISCUSS,
  CHALLENGE,
  ADVICE,
  DREAM
}
export interface Challenge {
  name: string;
  dateFin: string;
  tempsRestant: string;
  usefullResponses: string[];
}
export interface Advice {
  title: string;
  usefullResponses: string[];
}
export interface Dream {
  title: string;
  usefullResponses: string[];
}
export interface Atelier {
  name: string;
  css: string;
  typeAtelier: string;
  done: boolean;
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
  view = Page.INTRODUCTION;
  notificationsAdivce = 0;
  notificationsChallenge = 0;
  notificationsDream = 0;
  storageVersion: string;
  appVersion = '0.05';

  myAdvices: Advice[] = [];
  myChallenges: Challenge[] = [];
  myDreams: Dream[] = [];
  usefullResponses: string[];

  dateLastOpeningApplication;

  ateliersPlanning: Atelier[];

  dfResponseReceivedEvent: any;
  dfRequestSentEvent: any;
  dfButtonClickedEvent: any;

  constructor() {
  }

  ngOnInit() {
    this.initLocalStorage();
    this.initEventFunctions();

    if (!Array.isArray(this.ateliersPlanning) || !this.ateliersPlanning.length) {
      this.initAteliersPlanning();
    } else if (!moment().isSame(this.dateLastOpeningApplication, 'day')) {
      this.resetAtelierDone();
    }

    this.saveAllToLocalStorage();

    this.initLngDetector();

    // OR
    // const lngDetector = new (require('languagedetect'));

  }

  initEventFunctions() {
    let _this = this;

    this.dfResponseReceivedEvent = function dfResponseReceivedEvent(event: any) {
      const clone = JSON.parse(JSON.stringify(event.detail.response));
      console.log('_this.lastResponseReceived', event);
      _this.lastResponseReceived.push(clone);
      _this.handleResponse(clone);
    }

    this.dfRequestSentEvent = function dfRequestSentEvent(event: any) {
      const LanguageDetect = require('languagedetect');
      const lngDetector = new LanguageDetect();
      const request = event.detail.requestBody.queryInput.text.text;

      if (!(lngDetector.detect(request, 5)).find(l => l[0] === 'french') && (request).toLocaleLowerCase() !== 'ok') {
        const dfMessenger = document.querySelector('df-messenger') as any;
        dfMessenger.renderCustomText('Je ne suis pas sûre d\'avoir compris votre dernière réponse...');
      }

      const clone = JSON.parse(JSON.stringify(event.detail.requestBody));
      _this.lastRequestSent.push(clone);
      console.log('_this.lastRequestSent', event.detail.requestBody);
    }

    this.dfButtonClickedEvent = function dfButtonClickedEvent(event: any) {
      console.log('button event');
      _this.subscribeToMessengerEvents(false);
      _this.chat = '';
      _this.setView(Page.DISCUSS);
    }
  }

  private initLngDetector() {
    const LanguageDetect = require('languagedetect');
    const lngDetector = new LanguageDetect();
  }

  initAteliersPlanning() {
    const discussion: Atelier = { name: 'Vous êtes en souffrance émotionnellement et vous souhaitez être apaisé', css: 'btn3', typeAtelier: 'discussion', done: false };
    // const discussion2: Atelier = {name: 'Comprenez-vous et explorez les solutions : Vos peurs', css: 'btn3', typeAtelier: 'discussion', done: false};
    const challenge: Atelier = { name: 'Changer vos habitudes : challenge du jour', css: 'btn4', typeAtelier: 'challenge', done: false };
    // const challenge2: Atelier = {name: 'Challenge du jour #2', css: 'btn4', typeAtelier: 'challenge', done: false};
    // const challenge3: Atelier = {name: 'Challenge du jour #3', css: 'btn4', typeAtelier: 'challenge', done: false};
    const reves: Atelier = { name: 'Cap sur vos rêves !', css: 'btn2', typeAtelier: 'reves', done: false };
    // const reves2: Atelier = {name: 'Vos rêves en marche #2', css: 'btn2', typeAtelier: 'reves', done: false};

    this.ateliersPlanning = [];
    this.ateliersPlanning.push(discussion);
    this.ateliersPlanning.push(challenge);
    this.ateliersPlanning.push(reves);
  }

  resetAtelierDone() {
    this.ateliersPlanning.forEach(atelier => {
      atelier.done = false;
    })
  }

  initLocalStorage() {
    this.storageVersion = localStorage.getItem('storageVersion');
    this.notificationsAdivce = +localStorage.getItem('notificationsAdivce') || 0;
    this.notificationsChallenge = +localStorage.getItem('notificationsChallenge') || 0;
    this.ateliersPlanning = JSON.parse(localStorage.getItem('ateliersPlanning')) || [];
    this.myChallenges = JSON.parse(localStorage.getItem('myChallenges')) || [];
    this.myDreams = JSON.parse(localStorage.getItem('myDreams')) || [];
    this.dateLastOpeningApplication = localStorage.getItem('dateLastOpeningApplication');
    this.myAdvices = JSON.parse(localStorage.getItem('myAdvices'));

    // if (this.storageVersion === '0.03') {
    //   this.myAdvices = [];
    //   this.myDreams = [];
    //   (JSON.parse(localStorage.getItem('myAdvices')) as string[]).forEach(advice => this.myAdvices.push({ title: advice, usefullResponses: [] }));
    // }
    if (this.storageVersion !== this.appVersion) {
      this.notificationsAdivce = 0;
      this.notificationsChallenge = 0;
      this.ateliersPlanning = [];
      this.myAdvices = [];
      this.myChallenges = [];
      this.myDreams = [];
      this.dateLastOpeningApplication = moment().format();
    }
  }

  saveAllToLocalStorage() {
    localStorage.setItem('notificationsAdivce', String(this.notificationsAdivce));
    localStorage.setItem('notificationsChallenge', String(this.notificationsChallenge));
    localStorage.setItem('dateLastOpeningApplication', String(this.dateLastOpeningApplication));
    localStorage.setItem('storageVersion', String(this.appVersion));
    localStorage.setItem('ateliersPlanning', JSON.stringify(this.ateliersPlanning));
    localStorage.setItem('myAdvices', JSON.stringify(this.myAdvices));
    localStorage.setItem('myChallenges', JSON.stringify(this.myChallenges));
    localStorage.setItem('myDreams', JSON.stringify(this.myDreams));
  }

  dfMessengerInit() {
    this.lastRequestSent = [];
    this.lastResponseReceived = [];
    this.setMessengerStyle();
    this.subscribeToMessengerEvents(true);
  }

  setMessengerStyle() {
    const dfMessenger: any = document.querySelector('df-messenger').shadowRoot;
    const dfMessengerChat: any = dfMessenger.querySelector('df-messenger-chat').shadowRoot;
    const messagesList = dfMessengerChat.querySelector('df-message-list').shadowRoot;
    const bgElement = <HTMLElement>messagesList.querySelector('.message-list-wrapper');
    console.log('bgElement', bgElement);
    bgElement.style.background = 'url("assets/images/psy.jpg") no-repeat center center fixed';
    bgElement.style.height = '100%';
    bgElement.style.overflow = 'hidden';
    bgElement.style['background-size'] = 'cover';

    const messageList = <HTMLElement>messagesList.querySelector('#messageList');
    setTimeout(() => messageList.scrollTop = 0, 1500);


    const icon = <HTMLElement>dfMessenger.querySelector('#widgetIcon');
    console.log('icon', icon);
    icon.style.display = 'none';


    const chatWrapper = <HTMLElement>dfMessengerChat.querySelector('.chat-wrapper');
    chatWrapper.style.right = '0px';
    chatWrapper.style.bottom = '0px';
    chatWrapper.style.width = '100%';


    const dfMessengerUserInput = dfMessengerChat.querySelector('df-messenger-user-input').shadowRoot;
    const sendIcon = <HTMLElement>dfMessengerUserInput.querySelector('#sendIcon');
    console.log('dfMessengerUserInput.performButtonClickActions_', dfMessengerUserInput)


  }
  subscribeToMessengerEvents(subscribe: boolean) {

    const dfMessenger = document.querySelector('df-messenger');

    if (dfMessenger) {
      if (subscribe) {
        window.addEventListener('df-response-received', this.dfResponseReceivedEvent);
        dfMessenger.addEventListener('df-request-sent', this.dfRequestSentEvent);
        dfMessenger.addEventListener('df-button-clicked', this.dfButtonClickedEvent);
      } else {
        window.removeEventListener('df-response-received', this.dfResponseReceivedEvent);
        dfMessenger.removeEventListener('df-request-sent', this.dfRequestSentEvent);
        dfMessenger.removeEventListener('df-button-clicked', this.dfButtonClickedEvent);
      }
    }
  }


  handleResponse(response) {
    if (response && response.queryResult) {
      const fulfillmentMessages = response.queryResult.fulfillmentMessages as Array<any>;

      fulfillmentMessages.forEach(message => {
        if (message && message.payload && message.payload.dream) {
          const lastResponse: string = this.usefullResponses.pop();
          const dream: Dream = { title: lastResponse, usefullResponses: JSON.parse(JSON.stringify(this.usefullResponses)) };
          this.usefullResponses = [];
          this.myDreams.push(dream);
          this.notificationsDream++;
          this.saveAllToLocalStorage();
        } else if (message && message.payload && message.payload.challenge) {
          const challengeName = this.usefullResponses.pop();
          let challenge: Challenge = { name: challengeName, dateFin: moment().add(1, 'days').format(), tempsRestant: '', usefullResponses: JSON.parse(JSON.stringify(this.usefullResponses)) };
          this.usefullResponses = [];
          this.myChallenges.push(challenge);
          this.notificationsChallenge++;
          this.saveAllToLocalStorage();
        } else if (message && message.payload && message.payload.advice) {
          const lastResponse: string = this.usefullResponses.pop();
          const advice: Advice = { title: lastResponse, usefullResponses: JSON.parse(JSON.stringify(this.usefullResponses)) };
          this.usefullResponses = [];
          this.myAdvices.push(advice);
          this.notificationsAdivce++;
          this.saveAllToLocalStorage();
        }

        if (message && message.payload && message.payload.lastReponseUsefull && this.lastRequestSent.length > 0) {
          console.log('pushing usefullResponses', this.usefullResponses, this.lastRequestSent[this.lastRequestSent.length - 1].queryInput.text.text)
          this.usefullResponses.push(this.lastRequestSent[this.lastRequestSent.length - 1].queryInput.text.text);
        }
      });
    }
  }

  initMessengerWhenOpened() {
    const messenger = document.querySelector('df-messenger');
    if (messenger) {
      console.log('messenger', messenger)
      this.dfMessengerInit();
    } else {
      setTimeout(() => this.initMessengerWhenOpened(), 100);
    }
  }

  startChat(chatType: string) {
    this.usefullResponses = [];
    this.subscribeToMessengerEvents(false);
    this.chat = '';
    setTimeout(() => {
      this.chat = chatType;
      this.initMessengerWhenOpened();
    }, 100);

    // if (chatType === this.chat) {
    //   const messenger = document.querySelector('df-messenger') as any;
    //   messenger.toggleExpandAttribute_();
    // } else {

    // }

    // if(chatType === 'day' &&  this.ateliersPlanning[0].typeAtelier === chatType) {
    //   // Popup
    // } else if(chatType === 'reves' && this.revesLocked) {
    //   // Popup
    // } else {

    // }
  }

  setView(page: Page) {
    if (this.myChallenges.length === 0 && page === Page.CHALLENGE) {
      // Ne rien faire pour l'instant
    } else if (this.myAdvices.length === 0 && page === Page.ADVICE) {
      // Ne rien faire pour l'instant
    } else if (this.myDreams.length === 0 && page === Page.DREAM) {
      // Ne rien faire pour l'instant
    } else {
      if (page === Page.ADVICE) {
        this.notificationsAdivce = 0;
        this.saveAllToLocalStorage();
      } else if (page === Page.CHALLENGE) {
        this.notificationsChallenge = 0;
        this.computeTempsRestantOfChallenges();
        this.saveAllToLocalStorage();
      } else if (page === Page.DREAM) {
        this.notificationsDream = 0;
        this.saveAllToLocalStorage();
      }
      this.scrollToTop();
      this.view = page;
    }

  }

  computeTempsRestantOfChallenges() {
    this.myChallenges.forEach(challenge => {
      if (moment().isSameOrAfter(challenge.dateFin)) {
        challenge.tempsRestant = 'Challenge terminé ✔'
      } else {
        const tempsRestant = moment.utc(moment(challenge.dateFin).diff(moment()));
        challenge.tempsRestant = tempsRestant.format("HH") + ' heure(s) et ' + tempsRestant.format("mm") + ' minute(s) restantes';
      }
    })
  }

  scrollToTop() {
    var mainCard = document.getElementById('mainCard');
    mainCard.scrollTop = 0;
  }
}
