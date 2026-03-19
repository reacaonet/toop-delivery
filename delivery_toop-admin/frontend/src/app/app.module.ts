// Angular
import { BrowserModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GestureConfig } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { OverlayModule } from "@angular/cdk/overlay";
// Angular in memory
import { HttpClientInMemoryWebApiModule } from "angular-in-memory-web-api";
// Perfect Scroll bar
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
// SVG inline
import { InlineSVGModule } from "ng-inline-svg";
// Env
import { environment } from "../environments/environment";
// Hammer JS
import "hammerjs";
// NG Mask
import { NgxMaskModule } from "ngx-mask";
// NGX Permissions
import { NgxPermissionsModule, NgxPermissionsService } from "ngx-permissions";
// NGRX
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
// State
import { metaReducers, reducers } from "./core/reducers";
// Copmponents
import { AppComponent } from "./app.component";
// Modules
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { ThemeModule } from "./views/theme/theme.module";
// Partials
import { PartialsModule } from "./views/partials/partials.module";
// Layout Services
import {
	KtDialogService,
	LayoutConfigService,
	LayoutRefService,
	MenuAsideService,
	MenuConfigService,
	MenuHorizontalService,
	PageConfigService,
	SplashScreenService,
	SubheaderService,
} from "./core/_base/layout";
// Auth
import { AuthModule } from "./views/pages/auth/auth.module";
import { AuthService } from "./core/auth";
// CRUD
import { HttpUtilsService, LayoutUtilsService, TypesUtilsService } from "./core/_base/crud";
// Config
import { LayoutConfig } from "./core/_config/layout.config";
// Highlight JS
import { HIGHLIGHT_OPTIONS, HighlightLanguage } from "ngx-highlightjs";
import * as typescript from "highlight.js/lib/languages/typescript";
import * as scss from "highlight.js/lib/languages/scss";
import * as xml from "highlight.js/lib/languages/xml";
import * as json from "highlight.js/lib/languages/json";
import { MarkerService } from "./services/marker.service";
import { PopUpService } from "./services/pop-up.service";
import { ToastrModule } from "ngx-toastr";

import { AgmCoreModule } from "@agm/core";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";

// tslint:disable-next-line:class-name
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	wheelSpeed: 0.5,
	swipeEasing: true,
	minScrollbarLength: 40,
	maxScrollbarLength: 300,
};

export function initializeLayoutConfig(appConfig: LayoutConfigService) {
	// initialize app by loading default demo layout config
	return () => {
		if (appConfig.getConfig() === null) {
			appConfig.loadConfigs(new LayoutConfig().configs);
		}
	};
}

export function hljsLanguages(): HighlightLanguage[] {
	return [
		{ name: "typescript", func: typescript },
		{ name: "scss", func: scss },
		{ name: "xml", func: xml },
		{ name: "json", func: json },
	];
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserAnimationsModule,
		ToastrModule.forRoot(),
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		NgxPermissionsModule.forRoot(),
		NgxMaskModule.forRoot(),
		PartialsModule,
		CoreModule,
		OverlayModule,
		StoreModule.forRoot(reducers, { metaReducers }),
		EffectsModule.forRoot([]),
		StoreRouterConnectingModule.forRoot({ stateKey: "router" }),
		StoreDevtoolsModule.instrument(),
		AuthModule.forRoot(),
		TranslateModule.forRoot(),
		MatProgressSpinnerModule,
		InlineSVGModule.forRoot(),
		ThemeModule,
		AgmCoreModule.forRoot({
			apiKey: "AIzaSyBKnJQI86pHukHoh7wtGzyRMxJfemZpRGQ",
			libraries: ["places"],
		}),
		MatGoogleMapsAutocompleteModule,
	],
	exports: [NgxMaskModule],
	providers: [
		AuthService,
		LayoutConfigService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		KtDialogService,
		SplashScreenService,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig,
		},
		{
			// layout config initializer
			provide: APP_INITIALIZER,
			useFactory: initializeLayoutConfig,
			deps: [LayoutConfigService, NgxPermissionsService],
			multi: true,
		},
		{
			provide: HIGHLIGHT_OPTIONS,
			useValue: { languages: hljsLanguages },
		},
		// template services
		SubheaderService,
		MenuHorizontalService,
		MenuAsideService,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService,
		MarkerService,
		PopUpService,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
