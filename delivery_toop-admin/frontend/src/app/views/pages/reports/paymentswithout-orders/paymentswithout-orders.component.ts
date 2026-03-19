import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';

import { PaymentswithoutOrdersService } from './../../../../services/paymentswithout-orders.service';

@Component({
  selector: 'kt-paymentswithout-orders',
  templateUrl: './paymentswithout-orders.component.html',
  styleUrls: ['./paymentswithout-orders.component.scss']
})
export class PaymentswithoutOrdersComponent implements OnInit, AfterViewInit {

  dataSource;
  displayedColumns = ['company', 'customer', 'createdAt', 'total'];
  formData;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private PaywithoutOrdersService: PaymentswithoutOrdersService,
  ) { }

  async ngOnInit() {
    await this.getListPaywithoutOrders(0, this.pageSize);
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListPaywithoutOrders(
      event.pageIndex,
      event.pageSize,
    );
  }


  async getListPaywithoutOrders(pageIn, pageOut) {
    const self = this;
    let ELEMENT_DATA = [];
    this.PaywithoutOrdersService.getPaymentswithoutOrders(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((pay, index) => {

          const createdAt = moment(pay.createdAt, 'YYYY-MM-DD HH:mm').format('DD/MM/YY HH:mm');

          ELEMENT_DATA.push({
            _id: pay._id,
            position: (index + 1),
            company: (pay.company && Array.isArray(pay.company) && pay.company[0]?.name) ? pay.company[0]?.name : '-',
            customer: (pay?.customer?.person && Array.isArray(pay.customer.person) && pay.customer.person[0]?.name)
              ? pay.customer.person[0]?.name
              : '-',
            createdAt,
            total: pay.total,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });

  }

  ngAfterViewInit() {
  }


}