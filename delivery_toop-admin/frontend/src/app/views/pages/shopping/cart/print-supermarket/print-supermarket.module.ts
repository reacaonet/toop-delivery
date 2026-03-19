import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask";

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { NgxPermissionsModule } from 'ngx-permissions';

import { PrintSupermarketComponent } from './print-supermarket.component';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: false,
  decimal: ',',
  precision: 2,
  prefix: 'R$ ',
  suffix: '',
  thousands: '.'
};

@NgModule({
  declarations: [PrintSupermarketComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrintSupermarketComponent
      },
    ]),
    NgxPermissionsModule.forChild(),
  ],
	providers: [
    MatIconRegistry,
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    { provide: MatBottomSheetRef, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
})
export class PrintSupermarketModule { }

