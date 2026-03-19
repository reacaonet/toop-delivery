import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';

import { CompanyService } from './../../../../services/company.service';
import { NotificationTools } from './../../../../../models/notificationTools';
import { Alert } from './../../../../../models/alert';

@Component({
  selector: 'kt-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
