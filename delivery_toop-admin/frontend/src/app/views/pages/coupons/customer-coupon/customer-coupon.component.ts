import { CustomerService } from './../../../../services/customer.service';
import { Coupon } from './../../../../../models/coupon/coupon';
import { Person } from './../../../../../models/person';
import { Company } from './../../../../../models/company/company';
import { PersonService } from './../../../../services/person.service';
import { CompanyService } from './../../../../services/company.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { CouponService } from './../../../../services/shopping/coupon.service';

@Component({
  selector: 'kt-customer-coupon',
  templateUrl: './customer-coupon.component.html',
  styleUrls: ['./customer-coupon.component.scss']
})
export class CustomerCouponComponent implements OnInit {

  companies: Company[] = [];
  coupons: Coupon[] = [];
  dataSource;
  displayedColumns = ['person', 'total', 'couponPrice', 'totalCompany', 'priceDelivery', 'company', 'orderNumber', 'orderDate'];
  formData;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  person: Person[] = [];
  totalLength;
	idCoupon: string;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private couponService: CouponService,
    private companyService: CompanyService,
    private personService: PersonService,
		private customerService: CustomerService,
		private route: ActivatedRoute
  ) { }

  ngOnInit() {
		this.idCoupon = this.route.snapshot.paramMap.get('couponId');

    this.newFormData();
    this.getListCustomerCoupons(this.idCoupon, 0, this.pageSize);
  }

  newFormData() {
    this.formData = new FormGroup({
      _id: new FormControl(''),
      coupon: new FormControl('', ),
      company: new FormControl('', ),
      customer: new FormControl('', ),
      person: new FormControl('', ),
      payment: new FormControl('', ),
    });
    this.formData.get('company').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value) : [])
    ).subscribe(results => this.companies = results);

    this.formData.get('person').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.personService.getPersonNome(value) : [])
    ).subscribe(results => this.person = results);

    this.formData.get('coupon').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.couponService.getCouponsNome(value) : [])
    ).subscribe(results => this.companies = results);

    this.formData.get('customer').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.customerService.getCustomerNome(value) : [])
		).subscribe(results => this.person = results);

    this.formData.get('payment').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.customerService.getCustomerNome(value) : [])
    ).subscribe(results => this.person = results);
	}

	changePage(event) {
    this.pageSize = event.pageSize;
    this.getListCustomerCoupons(this.idCoupon ,event.pageIndex, event.pageSize);
  }

  async getListCustomerCoupons(couponId, pageIn, pageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.couponService.getCustomerCoupon(couponId, pageIn, pageOut).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			console.log('Data', data);

        data.forEach((customerCoupon, index) => {
          ELEMENT_DATA.push({
            _id: customerCoupon._id,
            position: (index + 1),
            person: customerCoupon.person[0],
						company: customerCoupon.company[0],
						payment: customerCoupon.payment[0],
            orderStatus: customerCoupon.orderStatus[0],
          });
				});

        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.length;
        this.changeDetectorRefs.detectChanges();
    });
  }


}
