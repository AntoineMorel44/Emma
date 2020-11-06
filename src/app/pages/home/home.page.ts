import { Component, Injector } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  chat: string = '';
  introduction = true;

  constructor() {
  }

  ngOnInit() {
    // setTimeout(() => this.dfMessengerInit(), 3000);


  }

  dfMessengerInit() {
    const dfMessenger: any = document.querySelector('df-messenger');
    console.log('dfMessenger', dfMessenger);
    // dfMessenger.renderCustomText('Custom text');

    // var innerDoc = dfMessenger.contentDocument ;
    const messagesList = dfMessenger.shadowRoot.querySelector('df-messenger-chat').shadowRoot.querySelector('df-message-list').shadowRoot;
    console.log('messageList', messagesList);

    const bgElement = <HTMLElement>messagesList.querySelector('.message-list-wrapper');


    // let bgElement = document.querySelectorAll('.message-list-wrapper');
    console.log('bgElement', bgElement);
    bgElement.style.background = 'url("assets/images/psy.jpg") no-repeat center center fixed';
    bgElement.style.height = '100%';
    bgElement.style.overflow = 'hidden';
    bgElement.style['background-size'] = 'cover';
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
