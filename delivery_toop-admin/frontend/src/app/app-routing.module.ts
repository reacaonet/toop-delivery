import { NgxPermissionsGuard, NgxPermissionsModule } from "ngx-permissions";
// Angular
import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
// Components
import { BaseComponent } from "./views/theme/base/base.component";
import { ErrorPageComponent } from "./views/theme/content/error-page/error-page.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
// Auth
import { AuthGuard } from "./core/auth";

import { ImageCompressService, ResizeOptions, ImageUtilityService } from "ng2-image-compress";

const routes: Routes = [
	{
		path: "register-company/franchise/:id",
		loadChildren: () =>
			import("./views/pages/public/company/company.module").then((m) => m.CompanyModule),
	},
	{
		path: "auth",
		loadChildren: () => import("./views/pages/auth/auth.module").then((m) => m.AuthModule),
	},
	{
		path: "shopping-cart/restaurant/print",
		loadChildren: () =>
			import("./views/pages/shopping/cart/print/print.module").then((m) => m.PrintModule),
	},
	{
		path: "shopping-cart/supermarket/print",
		loadChildren: () =>
			import("./views/pages/shopping/cart/print-supermarket/print-supermarket.module").then(
				(m) => m.PrintSupermarketModule
			),
	},
	{
		path: "",
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: "franchises",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToRoot"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/franchise/franchise.module").then((m) => m.FranchiseModule),
			},
			{
				path: "company/group",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToCompanyGroup"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/company/group/group.module").then((m) => m.GroupModule),
			},
			{
				path: "company/company",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToCompanyCompany"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/company/company/company.module").then((m) => m.CompanyModule),
			},
			{
				path: "company/coupon",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToCouponsCoupon"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/coupons/coupon/coupon.module").then((m) => m.CouponModule),
			},
			{
				path: "company/coupon/:couponId",
				loadChildren: () =>
					import("./views/pages/coupons/customer-coupon/customer-coupon.module").then(
						(m) => m.CustomerCouponModule
					),
			},
			{
				path: "company/delivery",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToCompanyDelivery"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/company/company-delivery/company-delivery.module").then(
						(m) => m.CompanyDeliveryModule
					),
			},
			{
				path: "company/segment",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToCompanySegment"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/company/segment/segment.module").then((m) => m.SegmentModule),
			},
			{
				path: "logs-log",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToLogsLog"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () => import("./views/pages/logs/log/log.module").then((m) => m.LogModule),
			},
			{
				path: "department-department",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToDepartmentDepartment", "accessToRegisterProduct"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/department/department/department.module").then(
						(m) => m.DepartmentModule
					),
			},
			{
				path: "establishment-slider",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToEstablishmentSlider"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/establishment/slider/slider.module").then((m) => m.SliderModule),
			},
			{
				path: "supermarket-tabloid",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToSupermarketTabloid"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/supermarket/tabloid/tabloid.module").then((m) => m.TabloidModule),
			},
			{
				path: "tools-notifications",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToToolsNotifications"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/tools/notifications-tools/notifications-tools.module").then(
						(m) => m.NotificationsToolsModule
					),
			},
			{
				path: "topic-notification",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToTopicNotification"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/tools/topic-notification/topic-notification.module").then(
						(m) => m.TopicNotificationModule
					),
			},
			{
				path: "custom-notification",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/tools/notifications/notification.module").then(
						(m) => m.NotificationModule
					),
			},
			{
				path: "app/popup",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToToolsPopup"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/tools/popup/popup.module").then((m) => m.PopupModule),
			},
			{
				path: "delivery-deliveryrecord",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToDeliveryRecord"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/delivery/delivery-record/delivery-record.module").then(
						(m) => m.DeliveryRecordModule
					),
			},
			{
				path: "accessgroup-accessGroup",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToAccessGroup"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/accessgroup/access-group.module").then((m) => m.AccessGroupModule),
			},
			{
				path: "shopping-cart/:type",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [
							"accessToGlobal",
							"accessToShoppingCart",
							"accessToFoodOrders",
							"accessToMarketOrders",
							"accessToAccessoriesMenu",
						],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/shopping/cart/cart.module").then((m) => m.CartModule),
			},
			{
				path: "v1/food/menu",
				loadChildren: () =>
					import("./views/pages/v1/food/menu/menu.module").then((m) => m.MenuModule),
			},
			{
				path: "v1-food-category",
				loadChildren: () => import("./views/pages/food/menu/menu.module").then((m) => m.MenuModule),
			},
			{
				path: "delivery-products",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToFoodMenu"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () => import("./views/pages/food/menu/menu.module").then((m) => m.MenuModule),
			},
			{
				path: "accessories-menu",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToAccessoriesMenu"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/accessories/menu/menu.module").then((m) => m.MenuModule),
			},
			{
				path: "person-person",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToPersonPerson"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/person/person/person.module").then((m) => m.PersonModule),
			},
			{
				path: "management-imagebank",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToManagementImageBank"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/management/image-bank/image-bank.module").then(
						(m) => m.ImageBankModule
					),
			},
			{
				path: "product",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRegisterProduct"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/register/product/product.module").then((m) => m.ProductModule),
			},
			{
				path: "emails/types",
				loadChildren: () =>
					import("./views/pages/email/type/type.module").then((m) => m.TermsModule),
			},
			{
				path: "emails/templates",
				loadChildren: () =>
					import("./views/pages/email/template/template.module").then((m) => m.TemplateModule),
			},
			{
				path: "settings-city",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToRoot"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/city/city.module").then((m) => m.CityModule),
			},

			{
				path: "app-versions",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToRoot"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/appVersion/appVersion.module").then(
						(m) => m.AppVersionModule
					),
			},

			{
				path: "general-settings",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToFranchises"],
						redirectTo: "/dashboard",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/general/general.module").then((m) => m.GeneralModule),
			},
			{
				path: "settings-types-users",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToSettingsTypesUsers"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/typesusers/typesusers.module").then(
						(m) => m.TypesusersModule
					),
			},
			{
				path: "shopper-shopper",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToShopperShopper"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/shopper/shopper/shopper.module").then((m) => m.ShopperModule),
			},
			{
				path: "packing-packing",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToPackingPacking"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/packing/packing/packing.module").then((m) => m.PackingModule),
			},
			{
				path: "user-user",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToUserUser"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () => import("./views/pages/user/user/user.module").then((m) => m.UserModule),
			},
			{
				path: "settings-controller",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToSettingsController"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/controller/controller.module").then(
						(m) => m.ControllerModule
					),
			},
			{
				path: "company/opening-hours",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToHoursCompany"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/settings/hours/hours.module").then((m) => m.HoursModule),
			},
			{
				path: "acl-module",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToAclModule"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/acl/module/module.module").then((m) => m.ModuleModule),
			},
			{
				path: "adm/roles",
				loadChildren: () =>
					import("./views/pages/acl/roles/roles.module").then((m) => m.RolesModule),
			},
			{
				path: "adm/products-bank",
				loadChildren: () =>
					import("./views/pages/register/product-bank/product-bank.module").then(
						(m) => m.ProductBankModule
					),
			},
			{
				path: "adm/permissions",
				loadChildren: () =>
					import("./views/pages/acl/permissions/permissions.module").then(
						(m) => m.PermissionsModule
					),
			},
			{
				path: "adm/noc",
				loadChildren: () => import("./views/pages/noc/noc/noc.module").then((m) => m.NocModule),
			},
			{
				path: "helpdesk/faq",
				loadChildren: () => import("./views/pages/faq/faq/faq.module").then((m) => m.FaqModule),
			},
			{
				path: "finance/type-payments",
				loadChildren: () =>
					import("./views/pages/finance/type-payments/type-payments.module").then(
						(m) => m.TypePaymentsModule
					),
			},
			// {
			// 	path: "finance/braspag/subordinates",
			// 	loadChildren: () =>
			// 		import("./views/pages/finance/subordinate/subordinate.module").then(
			// 			(m) => m.SubordinateModule
			// 		),
			// },
			{
				path: "finance/braspag/transactions",
				loadChildren: () =>
					import("./views/pages/finance/transactions-braspag/transactions-braspag.module").then(
						(m) => m.TransactionsBraspagModule
					),
			},
			{
				path: "finance/invoice",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToTransactions"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/finance/invoice/invoice.module").then((m) => m.InvoiceModule),
			},
			{
				path: "finance/digital-accounts/banks",
				loadChildren: () =>
					import("./views/pages/finance/digital-accounts/banks/banks.module").then(
						(m) => m.BanksModule
					),
			},
			{
				path: "finance/digital-accounts/agencies",
				loadChildren: () =>
					import("./views/pages/finance/digital-accounts/agencies/agencies.module").then(
						(m) => m.AgenciesModule
					),
			},
			{
				path: "finance/digital-accounts/accounts",
				loadChildren: () =>
					import("./views/pages/finance/digital-accounts/accounts/accounts.module").then(
						(m) => m.AccountsModule
					),
			},
			{
				path: "finance/digital-accounts/extract",
				loadChildren: () =>
					import("./views/pages/finance/digital-accounts/extract/extract.module").then(
						(m) => m.ExtractModule
					),
			},
			{
				path: "finance/cost-centers",
				loadChildren: () =>
					import("./views/pages/finance/cost-centers/cost-centers.module").then(
						(m) => m.CostCentersModule
					),
			},
			{
				path: "finance/vouchers",
				loadChildren: () =>
					import("./views/pages/finance/voucher/voucher.module").then((m) => m.VoucherModule),
			},
			{
				path: "cashbask/campaigns",
				loadChildren: () =>
					import("./views/pages/cashback/campaign/campaign.module").then((m) => m.CampaignModule),
			},
			{
				path: "cashbask/received/:id",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/cashback/received/received.module").then(
						(m) => m.CampaignReceivedModule
					),
			},

			{
				path: "cashbask/histories",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/cashback/history/history.module").then(
						(m) => m.CampaignHistoryModule
					),
			},
			{
				path: "report/adm/financial",
				loadChildren: () =>
					import("./views/pages/reports/finacial-adm/finacial-adm.module").then(
						(m) => m.FinacialAdmModule
					),
			},
			{
				path: "report/financial",
				loadChildren: () =>
					import("./views/pages/reports/finacial/finacial.module").then((m) => m.FinacialModule),
			},
			{
				path: "report/financial-company",
				loadChildren: () =>
					import("./views/pages/reports/financial-company/financial-company.module").then(
						(m) => m.FinacialCompanyModule
					),
			},
			{
				path: "report/deliveries",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToFranchises"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/reports/deliveries/deliveries.module").then(
						(m) => m.DeliveriesModule
					),
			},
			{
				path: "report/customer",
				loadChildren: () =>
					import("./views/pages/reports/customer/customer.module").then((m) => m.CustomerModule),
			},
			{
				path: "report/canceled-orders",
				loadChildren: () =>
					import("./views/pages/reports/canceled-orders/canceled-orders.module").then(
						(m) => m.CustomerModule
					),
			},
			{
				path: "report/access-flow",
				loadChildren: () =>
					import("./views/pages/access/access-flow/access-flow.module").then(
						(m) => m.AccessFlowModule
					),
			},
			{
				path: "report/partners",
				loadChildren: () =>
					import("./views/pages/partners/partners/partners.module").then((m) => m.PartnersModule),
			},
			{
				path: "tools/integrations",
				loadChildren: () =>
					import("./views/pages/tools/integrations/integrations.module").then(
						(m) => m.IntegrationsModule
					),
			},
			{
				path: "app/category",
				loadChildren: () =>
					import("./views/pages/application/category/category.module").then(
						(m) => m.CategoryModule
					),
			},
			{
				path: "supermarketonline/integrations",
				loadChildren: () =>
					import("./views/pages/company/integrations/integrations.module").then(
						(y) => y.IntegrationsModule
					),
			},
			{
				path: "helpdesk/tickets",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToHelpDeskTickets"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/helpdesk/tickets/tickets.module").then((m) => m.TicketsModule),
			},
			{
				path: "helpdesk/tickets/:protocol",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToHelpDeskTicketInteration"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/helpdesk/tickets/ticket-interation/ticket-interation.module").then(
						(m) => m.TicketInterationModule
					),
			},
			{
				path: "supermarketonline-paymentmethods",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToPaymentmethos"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/supermarketOnline/payment-methods/payment-methods.module").then(
						(m) => m.PaymentMethodsModule
					),
			},
			{
				path: "dashboard",
				canActivate: [NgxPermissionsGuard],
				loadChildren: () =>
					import("./views/pages/dashboard/dashboard.module").then((m) => m.DashboardModule),
			},
			{
				path: "mail",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToMail"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () => import("./views/pages/apps/mail/mail.module").then((m) => m.MailModule),
			},
			{
				path: "support/shopping-cart",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToSupport"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/support/shopping-cart/shopping-cart.module").then(
						(m) => m.ShoppingCartsModule
					),
			},
			{
				path: "support/bug-orders",
				loadChildren: () =>
					import("./views/pages/reports/paymentswithout-orders/paymentswithout-orders.module").then(
						(m) => m.PaymentswithoutOrdersModule
					),
			},
			{
				path: "user-management",
				loadChildren: () =>
					import("./views/pages/user-management/user-management.module").then(
						(m) => m.UserManagementModule
					),
			},
			{
				path: "builder",
				loadChildren: () =>
					import("./views/theme/content/builder/builder.module").then((m) => m.BuilderModule),
			},
			{
				path: "report/deliverymanlive",
				loadChildren: () =>
					import("./views/pages/reports/deliveryman-live/deliveryman-live.module").then(
						(m) => m.DeliverymanLiveModule
					),
			},
			{
				path: "report/favorite-products",
				loadChildren: () =>
					import("./views/pages/reports/favorite-products/favorite-products.module").then(
						(m) => m.FavoriteProductsModule
					),
			},
			{
				path: "marketing/campaign",
				loadChildren: () =>
					import("./views/pages/marketing/campaign/campaign.module").then((m) => m.CampaignModule),
			},
			{
				path: "loose-delivery",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: [
							"accessToGlobal",
							"accessToShoppingCart",
							"accessToFoodOrders",
							"accessToMarketOrders",
							"accessToAccessoriesMenu",
						],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/shopping/loose-delivery/loose-delivery.mode").then(
						(m) => m.LooseDeliveryModel
					),
			},
			{
				path: "error/403",
				component: ErrorPageComponent,
				data: {
					type: "error-v6",
					code: 403,
					title: "403... Acesso negado",
					desc: "Parece que você não tem permissão para acessar a página solicitada. <br> Entre em contato com o administrador          ",
				},
			},
		],
	},
	////
	{
		path: "",
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: "mobility/parameters-subjects",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToSubject"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/supportSubject/supportSubject.module").then(
						(m) => m.SupportSubjectModule
					),
			},
			{
				path: "mobility/passengers",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToPassengers"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/passengers/passengers.module").then(
						(m) => m.PassengersModule
					),
			},
			{
				path: "mobility/schedule",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/schedule/schedule.module").then((m) => m.ScheduleModule),
			},
			{
				path: "mobility/drivers",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToDrivers"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/drivers/drivers.module").then((m) => m.DriversModule),
			},
			{
				path: "mobility/push-notifications",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToNotifications"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/pushNotification/push-notification.module").then(
						(m) => m.PushNotificationModule
					),
			},
			{
				path: "mobility/parameters-documenttypes",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToDocumentsTypes"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/documentType/documentType.module").then(
						(m) => m.DocumentTypeModule
					),
			},
			{
				path: "mobility/parameters-peakhours",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToPeakHours"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/peakHour/peakHour.module").then((m) => m.PeakHourModule),
			},
			{
				path: "mobility/services",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToServices"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/service/service.module").then((m) => m.ServiceModule),
			},
			{
				path: "mobility/services/new",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToServices"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/service/service-details/service-details.module").then(
						(m) => m.ServiceDetailsModule
					),
			},
			{
				path: "mobility/services/details/:_id",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessMobilityToServices"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/service/service-details/service-details.module").then(
						(m) => m.ServiceDetailsModule
					),
			},
			{
				path: "mobility/slider",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToSlider"],
						redirectTo: "/error/4d",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/slider/slider.module").then((m) => m.SliderModule),
			},
			{
				path: "mobility/evaluation/passenger",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToServices"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/evaluationPassenger/evaluation-passenger.module").then(
						(m) => m.EvaluationPassengerModule
					),
			},
			{
				path: "mobility/evaluation/driver",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToServices"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/evaluationDriver/evaluation-driver.module").then(
						(m) => m.EvaluationDriverModule
					),
			},
			{
				path: "mobility/settings/general",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilitySettingsToGeneral"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/settings/driver/driver.module").then(
						(m) => m.DriverModule
					),
			},
			{
				path: "mobility/map/general",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessMobilityToServices"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/map/general-map/general-map.module").then(
						(m) => m.GeneralMapModule
					),
			},
			{
				path: "mobility/map/heatmap",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/map/heatmap/heatmap.module").then((m) => m.HeatmapModule),
			},
			{
				path: "mobility/map/monitoring",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/map/monitoring/monitoring.module").then(
						(m) => m.MonitoringModule
					),
			},
			{
				path: "mobility/vehicle",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/register/vehicle/vehicle.module").then(
						(m) => m.VehicleModule
					),
			},
			{
				path: "mobility/discount",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToRoot", "accessToGlobal", "discountCoupon"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/register/discount/discount.module").then(
						(m) => m.DiscountModule
					),
			},
			{
				path: "approval-drivers",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal", "accessToRoot", "accessToDeliveryRecord", "accessToDrivers"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/register/drivers/drivers.module").then((m) => m.DriversModule),
			},
			{
				path: "mobility/report/adm/driver",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/report/adm/driver/report-driver.module").then(
						(m) => m.ReportDriverModule
					),
			},
			{
				path: "mobility/report/passenger",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/report/passenger/passenger.module").then(
						(m) => m.PassengerModule
					),
			},
			{
				path: "mobility/report/driver",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/report/driver/driver.module").then((m) => m.DriverModule),
			},
			{
				path: "mobility/report/races",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/report/races/races.module").then((m) => m.RacesModule),
			},
			{
				path: "mobility/report/logs",
				canActivate: [NgxPermissionsGuard],
				data: {
					permissions: {
						only: ["accessToRoot", "accessToReportLogs", "accessToGlobal"],
						redirectTo: "/error/403",
					},
				},
				loadChildren: () =>
					import("./views/pages/mobility/report/logs/logs.module").then((m) => m.LogsModule),
			},
			{ path: "error/:type", component: ErrorPageComponent },
			{ path: "", redirectTo: "/dashboard", pathMatch: "full" },
			{ path: "**", redirectTo: "/dashboard", pathMatch: "full" },
		],
	},

	{ path: "**", redirectTo: "error/403", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes), NgbModule],
	providers: [ImageCompressService, ResizeOptions],
	exports: [RouterModule],
})
export class AppRoutingModule { }
