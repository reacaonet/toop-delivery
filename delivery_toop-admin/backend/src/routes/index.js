const router = require("express").Router();

/* Version */
const v2 = require("./v2");

//middleware check auth
const auth = require("../middleware/token");

/** Routes */
const Normalize = require("./Normalize");

const EmailRoute = require("./Email");
const AcessFLowRoute = require("./AcessFlow");
const AcessGroupRoute = require("./AcessGroupRouter");
const AclRoute = require("./Acl");
const ApplicaitonRoute = require("./Application");
const AuthRoute = require("./AuthRoutes");
const AvaliationRoute = require("./AvaliationRoute");
const BraspagRoute = require("./Braspag");
const ChatRoute = require("./Chat/chatRoutes");
const CouponCompanyRoute = require("./CouponCompanyRouter");
const CouponRoute = require("./CouponRouter");
const CompanyRoute = require("./Company");
const CustomerRoute = require("./CustomerRouter");
const DeliveryManRoute = require("./DeliveryManRouter");
const Department = require("./Shopping/DepartmentRouter");
const DepartmentMobile = require("./Shopping/DepartmentMobileRouter");
const faqRoute = require("./Support/FaqRouter");
const FncRoute = require("./Finance");
const FoodRoute = require("./Food");
const Franchises = require("./Franchises");
const GlobalSettingsRoute = require("./GlobalSettingsRouter");
const GroupRoute = require("./GroupRouter");
const ImageBankRoute = require("./ImageBankRouter");
const Health = require("./HealthRoutes");
const HelpDeskRoute = require("./HelpDesk");
const LogRoute = require("./LogRouter");
const MarketingRoute = require("./Marketing");
const NoficationRoute = require("./NotificationRouter");
const OfferRoute = require("./OfferRouter");
const OrderStatus = require("./Shopping/OrderRouter");
const PackingRouter = require("./PackingRouter");
const PaymentRoute = require("./Payment");
const PersonRoute = require("./Person/PersonRoutes");
const ProductRoute = require("./ProductRouter");
const RegisterDeliveryMan = require("./RegisterDeliveryManRouter");
const ReportRoute = require("./Report");
const SearchUser = require("./SearchUserRouter");
const SendImages = require("./SendImagesRouter");
const SendFiles = require("./SendFilesRouter");
const SettingRoute = require("./Setting");
const ShopperRoute = require("./ShopperRouter");
const ShoppingRoute = require("./Shopping");
const SliderRoute = require("./SliderRouter");
const SynchronizeProducts = require("./SynchronizeProducts/SynchronizeRoute");
const TabloidRoute = require("./TabloidRouter");
const Tip = require("./TipRouter");
const TipDeliveryMan = require("./TipDeliveryManRouter");
const ToolsRoute = require("./Tools");
const UserRoute = require("./UserRoute");
const V1FoodRoute = require("./v1/Food");
const Cashback = require("./Cashback");
const Mobility = require("./Mobility");
const ImageUploadRouter = require("./Image/ImageRouter");
const walletVoucher = require('./v2/wallet/voucher');
const Wallet = require('./v2/wallet');

// Temporary
const SyncLegacy = require("./SyncLegacy");

const listInvoice = require("../controllers/Shopping/Payment/listInvoiceController");
const PreRegistrationRoute = require("./PreRegistration/PreRegistrationRoute");

// const Filter = require("./Filter");
const Search = require("./Search/searchRoute");
const MonitorOrder = require("./Monitor/order");
const MonitorSales = require("./Monitor/sales");

/** Normalize */
router.use("/normalize", Normalize);

/* Routes Version */
router.use("/v2", v2);
const Front = require("./front/v1");

const Twilio = require("./twilio");
const { compressImg, changeImg } = require("../controllers/Tools/CompressImages");

router.use("/register-deliveryman", auth, RegisterDeliveryMan);
router.use("/send-images", auth, SendImages);
router.use("/send-files", SendFiles);

router.use("/TipDeliveryMan", auth, TipDeliveryMan);
router.use("/Tip", auth, Tip);
router.use("/acl", AclRoute);
router.use("/emails", EmailRoute);
router.use("/application", auth, ApplicaitonRoute);
router.use("/auth", AuthRoute);
router.use("/acessGroup", auth, AcessGroupRoute);
router.use("/report", auth, ReportRoute);
router.use("/global/settings", auth, GlobalSettingsRoute);
router.use("/company", auth, CompanyRoute);
router.use("/customer", CustomerRoute);

// Desativar se não for usar mais
router.use("/deliveryMan", auth, DeliveryManRoute);
router.use("/delivery-man", auth, DeliveryManRoute);
router.use("/group", auth, GroupRoute);
router.use("/imageBank", auth, ImageBankRoute);
router.use("/packing", auth, PackingRouter);
router.use("/notification", auth, NoficationRoute);
router.use("/offer", auth, OfferRoute);
router.use("/product", auth, ProductRoute);
router.use("/marketing", auth, MarketingRoute);
router.use("/slider", auth, SliderRoute);
router.use("/tabloid", auth, TabloidRoute);
router.use("/user", UserRoute);
router.use("/users", UserRoute);
router.use("/chat", auth, ChatRoute); // ok
router.use("/person", auth, PersonRoute); // ok
router.use("/order", auth, OrderStatus);
router.use("/shopper", auth, ShopperRoute);
router.use("/coupon", auth, CouponRoute);
router.use("/couponCompany", auth, CouponCompanyRoute);
router.use("/log", auth, LogRoute);
router.use("/acess-flow", auth, AcessFLowRoute);
router.use("/department", auth, Department);
router.use("/departmentmobile", auth, DepartmentMobile);
router.use("/faq", faqRoute);
router.use("/sync-legacy", SyncLegacy);

//Fnc
router.use("/finance", auth, FncRoute);

// Foods
//router.use('/food/category', FoodCategoryRoute);
router.use("/food", auth, FoodRoute);
router.use("/v1/food", auth, V1FoodRoute);
// Shopping Routes
router.use("/shopping", auth, ShoppingRoute);
//Setting Routes (cidade/estado)
router.use("/setting", auth, SettingRoute);
// Payment
router.use("/payment", auth, PaymentRoute);
router.use("/braspag", auth, BraspagRoute);
// Avaliation
router.use("/avaliation", auth, AvaliationRoute);
//popup
router.use("/tools", auth, ToolsRoute);
// Syncronize Products
router.use("/synchronize-product", auth, SynchronizeProducts);
// Health
router.use("/health", auth, Health);

//HelpDesk Routes (tickets/ticket)
router.use("/helpdesk", auth, HelpDeskRoute);

// Monitoramento
router.use("/monitor/order", auth, MonitorOrder);
router.use("/monitor/sales", auth, MonitorSales);

// Rotas especificas para front
router.use("/v1/front", Front);

// Busca no App
router.use("/v1/search", auth, Search);
router.use("/search-user", auth, SearchUser);

// Compress image and change folder
router.post("/food/compress-image", auth, compressImg);
router.post("/food/change-folder", auth, changeImg);

// Twilio
router.post("/twilio", auth, Twilio);

router.get("/listInvoice", auth, listInvoice);

// Franchises
router.use("/franchises", auth, Franchises);

router.use("/cashback", Cashback);

// Mobility
router.use("/v1/mobility", Mobility);
router.use("/mobility", Mobility);

// Wallet
router.use('/v2/vouchers', walletVoucher);
router.use('/v2/wallet', Wallet);

/** Limpar Usuario e vinculos */
// const clean = require('../controllers/Clean/clean');
// router.post("/clean", clean);

const cleanFranchise = require("../controllers/Clean/clean");
router.get("/cleanfranchise/:franchise", cleanFranchise.cleanAllFranchise);

router.use("/pre-register", PreRegistrationRoute);
router.use("/image", ImageUploadRouter);

module.exports = router;
