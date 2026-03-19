import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipInputEvent } from '@angular/material/chips';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { FavoriteproductsService } from './../../../../services/favoriteproducts.service';

@Component({
  selector: 'kt-favorite-products',
  templateUrl: './favorite-products.component.html',
  styleUrls: ['./favorite-products.component.scss']
})
export class FavoriteProductsComponent implements OnInit, AfterViewInit {

  companyValue: string;
  dataSource;
  displayedColumns = ['image', 'name', 'price', 'qtd'];
  favoriteProductsIdToDelete;
  formData;
  formFilter: FormGroup;
  formSubmitFavoriteProducts = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [2, 50, 100];
  totalLength;
  typeAction = 'create';

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private favoriteProductsService: FavoriteproductsService,
  ) { }

  async ngOnInit() {
    await this.getListFavoriteProducts(1, this.pageSize);
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListFavoriteProducts((event.pageIndex + 1), event.pageSize);
  }

  async getListFavoriteProducts(page, limit: any) {
    const self = this;
    let ELEMENT_DATA = [];
    this.favoriteProductsService.showFavoriteProducts(page, limit).subscribe((data: any) => {

      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.response && Array.isArray(data.response)) {
        data.response.forEach((favProducts, index) => {
          ELEMENT_DATA.push({
            _id: favProducts._id,
            position: (index + 1),
            image: (Array.isArray(favProducts?.product?.images) && favProducts?.product?.images[0] ) ? favProducts?.product?.images[0] : undefined,
            name: (favProducts.product && favProducts.product.name) ? favProducts.product.name : '-',
            qtd: (favProducts.qtd) ? favProducts.qtd : 0,
            price: (favProducts.product && favProducts.product.price) ? favProducts.product.price : '-',
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data?.total?.documents || 0;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
  }

}
