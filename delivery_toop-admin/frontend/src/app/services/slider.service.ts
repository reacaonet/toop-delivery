import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import { Slider } from './../../models/slider';

@Injectable({
  providedIn: 'root'
})
export class SliderService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {

  }

  getSlider() {
    return this.http.get(`${this.apiUrl}/slider/list`);
  }

  getSliderPaginator(pageIn, pageOut, name) {
    let filter = '';

    if (name) {
      filter += `&name=${name}`;
    }
    return this.http.get(`${this.apiUrl}/slider/paginator/?pageIn=${pageIn}&pageOut=${pageOut}${filter}`);
  }

  createSlider(slider: Slider) {
    return this.http.post(`${this.apiUrl}/slider/create`, slider);
  }

  updateSlider(slider: Slider) {
    return this.http.put(`${this.apiUrl}/slider/update/${slider._id}`, slider);
  }

  deleteSlider(id) {
    return this.http.delete(`${this.apiUrl}/slider/delete/${id}`);
  }

}
