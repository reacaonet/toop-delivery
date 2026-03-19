import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Person } from './../../models/person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getPerson() {
    return this.http.get(`${this.apiUrl}/person`);
  }

  getPersonId(id: string) {
    return this.http.get(`${this.apiUrl}/person/${id}`);
  }

  getPersonPaginator(pageIn, pageOut, name, cpf) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    if (cpf) {
      filter += `&cpf=${cpf}`;
    }

    return this.http.get(`${this.apiUrl}/person/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  getPersonNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/person/listPorNome?listPorNome=${name}`);
  }

  createPerson(person: Person) {
    return this.http.post(`${this.apiUrl}/person`, person);
  }

  updatePerson(person: Person) {
    return this.http.put(`${this.apiUrl}/person/${person._id}`, person);
  }

  deletePerson(id) {
    return this.http.delete(`${this.apiUrl}/person/${id}`);
  }

}
