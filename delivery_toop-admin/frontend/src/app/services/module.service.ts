import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Module } from './../../models/module';


@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getModule() {
    return this.http.get(`${this.apiUrl}/setting/module`);
  }

  getModuleTree() {
    return this.http.get(`${this.apiUrl}/setting/module/tree`);
  }

  getModulePaginator(pageIn, pageOut) {
    return this.http.get(`${this.apiUrl}/setting/module/paginator/?pageIn=${pageIn}&pageOut=${pageOut}`);
  }

  getModulesNome(name) {
    if (name === '') {
      name = 'null';
    } else if (name && (typeof name === 'string')) {
      name = name.trim();
    }
    return this.http.get(`${this.apiUrl}/setting/module/listPorNome?listPorNome=${name}`);
  }

  createModule(module: Module) {
    return this.http.post(`${this.apiUrl}/setting/module`, module);
  }

  updateModule(module: Module) {
    return this.http.put(`${this.apiUrl}/setting/module/${module._id}`, module);
  }

  deleteModule(id) {
    return this.http.delete(`${this.apiUrl}/setting/module/${id}`);
  }
}
