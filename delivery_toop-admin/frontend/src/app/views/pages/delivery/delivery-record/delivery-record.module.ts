import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { NgbModalModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';

import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { NgxMaskModule } from 'ngx-mask';

import { DeliveryRecordComponent } from './delivery-record.component';

@NgModule({
  declarations: [
    DeliveryRecordComponent,
  ],
  imports: [
    MatPaginatorModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatRippleModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModalModule,
    NgbAlertModule,
    NgxMaskModule.forRoot(),
    TranslateModule,
        RouterModule.forChild([
          {
            path: '',
            component: DeliveryRecordComponent
          },
      ]),
  ],
  providers: [
    MatIconRegistry,
    { provide: MatBottomSheetRef, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },

  ],
})
export class DeliveryRecordModule { }
