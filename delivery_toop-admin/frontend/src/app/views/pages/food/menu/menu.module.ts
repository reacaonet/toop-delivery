import { TranslateModule } from "@ngx-translate/core";
import {
	CurrencyMaskModule,
	CurrencyMaskConfig,
	CURRENCY_MASK_CONFIG,
} from "ng2-currency-mask";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconRegistry } from "@angular/material/icon";
import { NgbModalModule, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatStepperModule } from "@angular/material/stepper";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MAT_DATE_LOCALE, MatRippleModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
	MatBottomSheetRef,
	MAT_BOTTOM_SHEET_DATA,
} from "@angular/material/bottom-sheet";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { NgxMaskModule } from "ngx-mask";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { MenuComponent } from "./menu.component";
import { PizzasComponent } from "./pizzas/pizzas.component";

// NgBootstrap
import {
	NgbDropdownModule,
	NgbTabsetModule,
	NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
	align: "right",
	allowNegative: false,
	decimal: ",",
	precision: 2,
	prefix: "R$ ",
	suffix: "",
	thousands: ".",
};

const MaterialComponents = [
	MatTabsModule,
	MatAutocompleteModule,
	MatFormFieldModule,
	MatSelectModule,
	MatInputModule,
	MatSlideToggleModule,
	MatCheckboxModule,
	MatTableModule,
	MatIconModule,
	MatCardModule,
	MatStepperModule,
	MatDialogModule,
	MatRippleModule,
];
@NgModule({
	declarations: [MenuComponent, PizzasComponent],
	imports: [
		MaterialComponents,
		DragDropModule,
		CurrencyMaskModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModalModule,
		NgbAlertModule,
		NgxMaskModule.forRoot(),
		TranslateModule.forChild(),
		//TranslateModule,
		RouterModule.forChild([
			{
				path: "",
				component: MenuComponent,
			},
		]),
		// ng-bootstrap modules
		NgbDropdownModule,
		NgbTabsetModule,
		NgbTooltipModule,
	],
	exports: [MaterialComponents],
	providers: [
		MatIconRegistry,
		{ provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
		{ provide: MatBottomSheetRef, useValue: {} },
		{ provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: "en-GB" },
		{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
	],
})
export class MenuModule {}
