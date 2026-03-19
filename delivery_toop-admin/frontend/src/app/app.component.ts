import { Subscription, Observable } from "rxjs";
// Angular
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
// Layout
import { LayoutConfigService, SplashScreenService, TranslationService } from "./core/_base/layout";
// language list
import { locale as enLang } from "./core/_config/i18n/en";
import { locale as ptBr } from "./core/_config/i18n/ptBr";
import databaseSync from "./services/firebase/FirebaseDatabaseSync";
import { environment } from "../environments/environment";

import { select, Store } from "@ngrx/store";
import { NgxPermissionsService } from "ngx-permissions";
import { AppState } from "./core/reducers";
import { currentUserPermissions, Permission } from "../app/core/auth";

@Component({
	// tslint:disable-next-line:component-selector
	selector: "body[kt-root]",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
	// Public properties
	title = "Metronic";
	loader: boolean;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
	private companyStorage = null;
	private firebaseInit = false;
	private firebase = null;
	private mp3Beep = new Audio("../assets/sounds/alert.mp3");

	/**
	 * Component constructor
	 *
	 * @param translationService: TranslationService
	 * @param router: Router
	 * @param layoutConfigService: LayoutCongifService
	 * @param splashScreenService: SplashScreenService
	 */
	constructor(
		private translationService: TranslationService,
		private router: Router,
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService
	) {
		// register translations
		this.translationService.loadTranslations(ptBr, enLang);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig("loader.enabled");
		this.firebase = databaseSync();

		const routerSubscription = this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();

				// scroll to top on every route change
				window.scrollTo(0, 0);

				// to display back the body content
				setTimeout(() => {
					document.body.classList.add("kt-page--loaded");
				}, 500);

				this.eventNewOrder();
			}
		});

		this.notificationPermission();
		this.unsubscribe.push(routerSubscription);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.unsubscribe.forEach((sb) => sb.unsubscribe());
	}

	async notificationPermission() {
		// console.log('Passei aqui ...', "Notification" in navigator, Notification.permission);
		if (!("Notification" in navigator)) {
			console.log("Esse browser não suporta notificações desktop");
		} else {
			if (Notification.permission !== "denied") {
				// Pede ao usuário para utilizar a Notificação Desktop
				await Notification.requestPermission();
			}
		}
	}

	async newOrderNotification() {
		try {
			if (Notification.permission === "granted") {
				const notification = new Notification("Título", {
					body: "Conteúdo da notificação",
				});
			}
		} catch (err) {}
	}

	// Pause sound after 40 seconds
	pauseSound(companyId) {
		setTimeout(() => {
			// this.mp3Beep.pause();
			document.getElementById("audio").innerHTML = "";

			this.firebase.ref(`${environment.firebasePath}newOrder/${companyId}`).remove();
		}, 40000);
	}

	async eventNewOrder() {
		try {
			if (this.companyStorage === null) {
				this.companyStorage = localStorage.getItem("@company-main")
					? JSON.parse(localStorage.getItem("@company-main"))
					: null;
			}

			if (this.companyStorage && this.companyStorage._id) {
				this.firebaseInit = true;
			}

			if (this.firebaseInit) {
				this.firebaseInit = false;
				this.firebase
					.ref(`${environment.firebasePath}newOrder/${this.companyStorage._id}`)
					.on("value", async (snapshot) => {
						try {
							// this.mp3Beep.pause();
							document.getElementById("audio").innerHTML = "";
							if (snapshot && snapshot.val() !== null) {
								// this.mp3Beep.load();
								// await this.newOrderNotification();
								setTimeout(() => {
									document.getElementById("audio").innerHTML = `
									<audio controls autoplay loop>
										<source src="../assets/sounds/alert.mp3">
									</audio>`;
									// this.mp3Beep.loop = true;
									// this.mp3Beep.play();
									this.pauseSound(this.companyStorage._id);
								}, 1000);
							}
						} catch (err) {
							console.log("Error Beep", err);
						}
					});
			}
		} catch (err) {
			console.log("Oops Fail eventNewOrder", err);
		}
	}
}
