import { Component, Injector } from '@angular/core';
import * as moment from 'moment';
// Importing bootstrap "node_modules/bootstrap/dist/css/bootstrap.min.css"
              
enum Page {
  INTRODUCTION,
  DISCUSS,
  CHALLENGE,
  ADVICE
}
export interface Challenge {
  name: string;
  dateFin: string;
  tempsRestant: string;
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
  advicesToAsk = 2;
  view = Page.INTRODUCTION;
  notificationsAdivce = 0;
  notificationsChallenge = 0;
  botAskingAdviceIndex = 0;
  botAskingChallengeIndex = 0;

  myAdvices: any[] = [];
  myChallenges: Challenge[] = [];

  dateLastOpeningApplication;

  ateliersPlanning: Atelier[];

  constructor() {
  }

  ngOnInit() {
    this.initLocalStorage();
    
    if(!Array.isArray(this.ateliersPlanning) || !this.ateliersPlanning.length) {
      this.initAteliersPlanning();
    } else if(!moment().isSame(this.dateLastOpeningApplication, 'day')) {
      this.updateAteliersPlanning();
    }

    this.saveAllToLocalStorage();
  } 

  initAteliersPlanning() {
    const discussion: Atelier = {name: 'Comprenez-vous et explorez les solutions', css: 'btn3', typeAtelier: 'discussion', done: false};
    const challenge: Atelier = {name: 'Challenge du jour', css: 'btn4', typeAtelier: 'challenge', done: false};
    const reves: Atelier = {name: 'Mettez vos rêves en marche', css: 'btn2', typeAtelier: 'reves', done: false};

    this.ateliersPlanning = [];
    this.ateliersPlanning.push(discussion);
    this.ateliersPlanning.push(challenge);
    this.ateliersPlanning.push(reves);
  }

  updateAteliersPlanning() {
    this.ateliersPlanning.push(this.ateliersPlanning.shift());
    this.ateliersPlanning[0].done = false;
  }

  initLocalStorage() {
    this.notificationsAdivce = +localStorage.getItem('notificationsAdivce') || 0;
    this.notificationsChallenge = +localStorage.getItem('notificationsChallenge') || 0;
    this.ateliersPlanning = JSON.parse(localStorage.getItem('ateliersPlanning')) || [];
    this.myAdvices = JSON.parse(localStorage.getItem('myAdvices')) || [];
    this.myChallenges = JSON.parse(localStorage.getItem('myChallenges')) || [];
    this.dateLastOpeningApplication = localStorage.getItem('dateLastOpeningApplication') || moment().format();
    // this.myAdvices =  [];
    // this.myChallenges = [];
  }

  saveAllToLocalStorage() {
    localStorage.setItem('notificationsAdivce', String(this.notificationsAdivce));
    localStorage.setItem('notificationsChallenge', String(this.notificationsChallenge));
    localStorage.setItem('dateLastOpeningApplication', String(this.dateLastOpeningApplication));
    localStorage.setItem('ateliersPlanning', JSON.stringify(this.ateliersPlanning));
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

    const messageList = <HTMLElement>messagesList.querySelector('#messageList');
    setTimeout(() => messageList.scrollTop = 0, 1500);

    
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
          const advice = this.lastRequestSent[this.botAskingAdviceIndex].queryInput.text.text;
          this.myAdvices.push(advice);
          this.notificationsAdivce++;
          this.ateliersPlanning[0].done = true;
          this.saveAllToLocalStorage();
        } else if(message && message.payload && message.payload.challenge) {
          const challengeName = this.lastRequestSent[this.botAskingChallengeIndex].queryInput.text.text;
          let challenge: Challenge = {name: challengeName, dateFin: moment().add(1, 'days').format(), tempsRestant: ''};
          this.myChallenges.push(challenge);
          this.notificationsChallenge++;
          this.ateliersPlanning[0].done = true;
          this.saveAllToLocalStorage();
        } else if(message && message.payload && message.payload.askingAdvice) {
          this.botAskingAdviceIndex = this.lastRequestSent.length;
        } else if(message && message.payload && message.payload.askingChallenge) {
          this.botAskingChallengeIndex = this.lastRequestSent.length;
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
      setTimeout(() => this.initMessengerWhenOpened(), 100);
    }
  }

  startChat(chatType: string) {
    if(!this.ateliersPlanning[0].done) {
      this.chat = '';
      setTimeout(() => {
        this.chat = chatType;
        this.initMessengerWhenOpened();
      }, 100);
    }

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
    } else if(this.myAdvices.length === 0 && page === Page.ADVICE) {
      // Ne rien faire pour l'instant
    } else {
      if(page === Page.ADVICE) {
        this.notificationsAdivce = 0;
        this.saveAllToLocalStorage();
      } else if(page === Page.CHALLENGE) {
        this.notificationsChallenge = 0;
        this.computeTempsRestantOfChallenges();
        this.saveAllToLocalStorage();
      }
      this.scrollToTop();
      this.view = page;
    }
    
  }

  computeTempsRestantOfChallenges() {
    this.myChallenges.forEach(challenge => {
      if(moment().isSameOrAfter(challenge.dateFin)) {
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
