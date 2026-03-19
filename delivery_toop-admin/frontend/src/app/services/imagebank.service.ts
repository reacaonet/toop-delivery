import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { tap } from 'rxjs/operators';
import { ImageBank } from './../../models/imageBank';

@Injectable({
  providedIn: 'root'
})
export class ImageBankService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getImageBank(barcode, pageIn, pageOut) {

    if (barcode === '') {
      barcode = 'null';
    } else if (barcode) {
      barcode = barcode.trim();
    }
    return this.http.get(`${this.apiUrl}/imageBank/list/${barcode}/${pageIn}/${pageOut}`);
  }

  getImageBankNome(nome, pageIn, pageOut) {

    if (nome === '') {
      nome = 'null';
    } else if (nome) {
      nome = encodeURIComponent(nome.trim());
    }
    return this.http.get(`${this.apiUrl}/imageBank/listPorNome/${nome}/${pageIn}/${pageOut}`);
  }

  getImageBankCategory(category, pageIn, pageOut) {

    if (category === '') {
      category = 'null';
    } else if (category) {
      category = encodeURIComponent(category.trim());
    }
    return this.http.get(`${this.apiUrl}/imageBank/listPorCategory/${category}/${pageIn}/${pageOut}`);
  }

  createImageBank(imageBank: ImageBank) {
    return this.http.post(`${this.apiUrl}/imageBank/create`, imageBank);
  }

  updateImageBank(imageBank: ImageBank) {
    return this.http.put(`${this.apiUrl}/imageBank/update/${imageBank._id}`, imageBank);
  }

  deleteImageBank(id) {

    return this.http.delete(`${this.apiUrl}/imageBank/delete/${id}`);
  }

}
