import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Chat } from './../../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getChatConversation(cartId: string) {
    return this.http.get(`${this.apiUrl}/v1/front/chat/${cartId}`);
  }

  sendChatConversation(Chat: Chat) {
    return this.http.post(`${this.apiUrl}/v1/front/chat`, Chat);
  }

}
