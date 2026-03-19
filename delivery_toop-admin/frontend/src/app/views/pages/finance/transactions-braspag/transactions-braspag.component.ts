import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, Directive } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionsBraspagService } from './../../../../services/transactions-braspag.service';
import { CompanyDeliveryService } from './../../../../services/companydelivery.service';
import { PaymentSearchService } from './../../../../services/payment/search.service';
import { OrderStatusService } from './../../../../services/orderStatus/orderStatus.service';
import { orderStatusUpdate } from './../../../../../models/order/orderStatus.type';

@Component({
  selector: 'kt-transactions-braspag',
  templateUrl: './transactions-braspag.component.html',
  styleUrls: ['./transactions-braspag.component.scss']
})
export class TransactionsBraspagComponent implements OnInit, AfterViewInit {

  dataSource;
  showDetails;
  displayedColumns = ['PaymentId', 'OrderCompany', 'OrderNumber', 'OrderId', 'AuthorizationDate', 'amount', 'detail'];
  formData;
  formFilter: FormGroup;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
  cardNumber = 'CardNumber';
  formSubmitFilter = false;

  @ViewChild("splitModal", { static: true }) splitModal: Directive;
  @ViewChild("splitDetail", { static: true }) splitDetail: Directive;
  transactionCurrent = null;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private transactionsBraspagService: TransactionsBraspagService,
    private CompanyDeliveryService: CompanyDeliveryService,
    private PaymentSearchService: PaymentSearchService,
    private OrderStatusService: OrderStatusService,
  ) { }

  async ngOnInit() {
    this.newFormFilter();
  }

  async filterDate(filter) {

    if (filter.initialDate && moment(filter.initialDate, 'DDMMYYYY').isValid()) {
      filter.initialDate = moment(filter.initialDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    if (filter.endDate && moment(filter.endDate, 'DDMMYYYY').isValid()) {
      filter.endDate = moment(filter.endDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    if (filter.initialDate > filter.endDate) {
      this.toastr.error('Data Final precisa ser maior que a inicial', 'Falha!');
      return;
    }


    // limpa o resultado atual
		this.dataSource = new MatTableDataSource([]);
    // Faz a consulta
    await this.getListTransactionsBraspag(filter.initialDate, filter.endDate, 0, this.pageSize);


    // apos finalizar o processo
    this.formSubmitFilter = false;
  }


  newFormFilter() {
    return new Promise(async (resolve, reject) => {
      this.formFilter = new FormGroup({
        endDate: new FormControl('', [Validators.required]),
        initialDate: new FormControl('', [Validators.required]),
      });
      return resolve(true);
    });
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    const initial = moment().subtract(7, 'days').format('YYYY-MM-DD').toString();
    const final = moment().format('YYYY-MM-DD').toString();

    this.getListTransactionsBraspag(initial, final, event.pageIndex, event.pageSize);
  }

  async validateFlag(cardNumber) {
    return new Promise(async (resolve, reject) => {
      let flagName;

      const flags: any = await this.transactionsBraspagService.getFlags(cardNumber).toPromise();

      if (flags && flags.data && flags.data.Provider) {
        switch (flags.data.Provider) {
          case 'Master':
            flagName = './assets/images/creditCard/master.png';
            break;
          case 'Visa':
            flagName = './assets/images/creditCard/visa.png';
            break;
          case 'Elo':
            flagName = './assets/images/creditCard/elo.jpeg';
            break;
          default:
            break;
        }
      }
      resolve(flagName);
    });
	}

	async showSplitDetail(info: any) {
		const infoDetails = info.detail;
		const newInfoDetails = [];

		for (const infoDetail of infoDetails) {
			const real = String(infoDetail.Amount).substr(0, (String(infoDetail.Amount).length - 2));
			const cents = String(infoDetail.Amount).substr(-2);

			newInfoDetails.push({
				SubordinateMerchantId: infoDetail.SubordinateMerchantId,
				Amount: real && cents ? Number(real + "." + cents) : -1,
				Fares: {
					Mdr: infoDetail.Fares.Mdr,
				}
			});
		}

		this.showDetails = newInfoDetails;
		this.modalService.open(this.splitDetail, {size: 'lg'}).result.then((result) => {
		}, (reason) => {

		});
	}

  async getListTransactionsBraspag(initialDate, finalDate, page, limit) {

    const self = this;
    const ELEMENT_DATA = [];

    this.transactionsBraspagService.getTransactionsBraspag(initialDate, finalDate, page, limit).subscribe(async (list: any) => {

      if (list && list.data && list.data.transactions && Array.isArray(list.data.transactions)) {
        let countIndex = 0;
        for await (const braspag of list.data.transactions) {
          let amount = 0;
          if (braspag.Schedules && typeof braspag.Schedules === 'string') {
						const scheduleItem: any = JSON.parse(braspag.Schedules);
            for await (const sch of scheduleItem) {
              if (sch.EventDescription && sch.EventDescription === 'Credit' && sch.InstallmentGrossAmount) {
                // Format money
                const real = String(sch.InstallmentGrossAmount).substr(0, (String(sch.InstallmentGrossAmount).length - 2));
                const cents = String(sch.InstallmentGrossAmount).substr(-2);
                amount = (real && cents) ? Number(real + '.' + cents) : -1;
              }
            }
					}

					let totalSplit = 0;

					if (braspag.SplitPayments) {
						totalSplit = braspag.SplitPayments;
					}

          const date = moment(braspag.AuthorizationDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YY HH:mm:ss');
          const dateCap = moment(braspag.CapturedDate, 'YYYY-MM-DD').format('DD/MM/YY');

          const payment: any = await this.PaymentSearchService.search({
            paymentProviderId: braspag.PaymentId
          }).toPromise();

          let totalPayment = 0;
          if (payment && payment.total) {
            totalPayment = payment.total;
          }

          let fee = 0;
          let mdr = 0.00;
					let cieloMerchantId = null;
          if (payment && payment.company) {
            const resp = await this.CompanyDeliveryService.getCompanyId(payment.company).toPromise();
            cieloMerchantId = resp[0].cieloMerchantId
            mdr = Number(`${resp[0].fee}`);
            fee = amount * (1 - Number(`0.${resp[0].fee}`));
          }

          let flagNameCard: any;
          if (braspag.CardNumber && typeof braspag.CardNumber === 'string') {
            flagNameCard = await this.validateFlag(braspag.CardNumber.substr(0, 6));
					}

					const elements: any = {
            _id: braspag._id,
            position: (++countIndex),
            PaymentId: braspag.PaymentId,
            Status: braspag.Status,
            CardNumber: flagNameCard || undefined,
						OrderId: braspag.OrderId,
            AuthorizationDate: date,
            amount,
            fee,
            mdr,
            cieloMerchantId,
            CapturedDate: dateCap,
            Nsu: braspag.Nsu,
            AuthorizationCode: braspag.AuthorizationCode,
						total: totalPayment,
						totalSplit,
          }

					if (braspag.OrderId) {
						const params: orderStatusUpdate = {
							shoppingCart: braspag.OrderId,
						};
						const orderData: any = await this.OrderStatusService.search(params).toPromise();

						if (orderData.order.company.name) {
							elements.OrderCompany = orderData.order.company.name;
						}

						if (orderData.order.order_number) {
							elements.OrderNumber = orderData.order.order_number;
						}
					}

          ELEMENT_DATA.push(elements);
        }

        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        this.changeDetectorRefs.detectChanges();
      }

    });
  }

  ngAfterViewInit() {
  }

	splitModalShow(item) {
    this.transactionCurrent = item;

    this.modalService.open(this.splitModal, { size: 'lg' }).result.then((result) => {
    }, (reason) => { });
  }

}
