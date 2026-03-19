import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconRegistry, MatIconModule } from "@angular/material/icon";
import { NgbModalModule, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CurrencyMaskModule, CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask";

import { MatTabsModule } from "@angular/material/tabs";
import { MAT_DATE_LOCALE, MatRippleModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { MatChipsModule } from "@angular/material/chips";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { NgxMaskModule } from "ngx-mask";
import { MatStepperModule } from "@angular/material/stepper";
import { MatCardModule } from "@angular/material/card";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

import { DriverComponent } from "./driver.component";

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
	align: "right",
	allowNegative: false,
	decimal: ",",
	precision: 2,
	prefix: "R$ ",
	suffix: "",
	thousands: ".",
};

@NgModule({
	declarations: [DriverComponent],
	imports: [
		MatIconModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatFormFieldModule,
		MatSelectModule,
		MatInputModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		MatTabsModule,
		MatDialogModule,
		MatStepperModule,
		MatPaginatorModule,
		MatRippleModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModalModule,
		NgbAlertModule,
		MatCardModule,
		CurrencyMaskModule,
		CKEditorModule,
		NgxMaskModule.forRoot(),
		TranslateModule,
		RouterModule.forChild([
			{
				path: "",
				component: DriverComponent,
			},
		]),
	],
	providers: [MatIconRegistry, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }, { provide: MatBottomSheetRef, useValue: {} }, { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} }, { provide: MAT_DATE_LOCALE, useValue: "en-GB" }, { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }],
})
export class DriverModule {}
