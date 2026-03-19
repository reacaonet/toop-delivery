// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { DashReportInstallationComponent } from './dash-report-installation/dash-report-installation.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashReportCompanyCartComponent } from './dash-report-company-cart/dash-report-company-cart.component';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		NgApexchartsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},
		]),
	],
	providers: [],
	declarations: [
		DashboardComponent,
		DashReportInstallationComponent,
		DashReportCompanyCartComponent,
	]
})
export class DashboardModule {
}
