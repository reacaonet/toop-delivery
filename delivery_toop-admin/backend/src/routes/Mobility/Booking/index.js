const router = require("express").Router();

/** Middware */
const auth = require("../../../middleware/token");
const checkFranquise = require("../../../middleware/checkFranchises");

/** Validators */
const createBookingValidate = require("../../../validator/mobility/booking/bookingCreate.validate");
const changeRouteValidate = require("../../../validator/mobility/booking/changeRoute.validate");
const createBookingScheduleValidate = require("../../../validator/mobility/booking/bookingCreateSchedule.validate");
const updateBookingScheduleValidate = require("../../../validator/mobility/booking/updateBooking.validate");

/** controllers */
const listController = require("../../../controllers/Mobility/booking/ListController");
const Create = require("../../../controllers/Mobility/booking/CreateController");
const QueueBooking = require("../../../controllers/Mobility/booking/QueueController");
const CancelPassenger = require("../../../controllers/Mobility/booking/CanceledPassengerController");
const CanceledDriver = require("../../../controllers/Mobility/booking/CanceledDriverController");
const ConfirmInProgress = require("../../../controllers/Mobility/booking/ConfirmInProgress");
const Complete = require("../../../controllers/Mobility/booking/CompleteController");
const PassengerHistory = require("../../../controllers/Mobility/booking/PassengerHistoryController");
const BookingDrinverHistory = require("../../../controllers/Mobility/booking/BookingDriverHistoryController");
const CancelLimitReached = require("../../../controllers/Mobility/booking/CancelLimitReachedController");
const ListCanceLimit = require("../../../controllers/Mobility/booking/listCancelLimitController");
const RefusedBooking = require("../../../controllers/Mobility/booking/RefusedBookingController");
const HeatMap = require("../../../controllers/Mobility/booking/HeatmapController");
const ChangeRoute = require("../../../controllers/Mobility/booking/ChangeRouteController");
const LastRacesPassenger = require("../../../controllers/Mobility/booking/LastRacesPassengerController");
const createDeliverymanController = require("../../../controllers/Mobility/booking/CreateDeliverymanController");
const NotifiedBookingController = require("../../../controllers/Mobility/booking/NotifiedBookingController");
const TravelBookingList = require("../../../controllers/Mobility/travelBooking/ListController");
const CreateScheduleController = require("../../../controllers/Mobility/booking/schedule/CreateScheduleController");
const updateScheduleController = require("../../../controllers/Mobility/booking/schedule/UpdateScheduleController");
const BookingDriverScheduled = require("../../../controllers/Mobility/booking/schedule/BookingDriverScheduledController");

router.get("/", listController);
router.get("/queue", QueueBooking);
router.get("/passenger/:passenger", PassengerHistory);
router.get("/driver/:driver", BookingDrinverHistory);
router.get("/cancel-limit-reached", ListCanceLimit);
router.get("/refused", RefusedBooking);
router.get("/heatmap", auth, checkFranquise, HeatMap);
router.get("/last-historic-passenger", auth, LastRacesPassenger);
router.get("/notified-booking/:booking", NotifiedBookingController);
router.get("/travel-info/:booking", TravelBookingList);
router.get("/scheduled/driver/:driver", auth, BookingDriverScheduled);
router.post("/deliveryman", createDeliverymanController);
router.post("/schedule", auth, createBookingScheduleValidate, CreateScheduleController);
router.post("/", createBookingValidate, Create);
router.put("/passenger-cancel/:bookingId", CancelPassenger);
router.put("/driver-cancel/:bookingId", CanceledDriver);
router.put("/cancel-limit-reached", CancelLimitReached);
router.put("/confirm-progress", ConfirmInProgress);
router.put("/complete", Complete);
router.put("/change-route", auth, changeRouteValidate, ChangeRoute);
router.put("/schedule", auth, updateBookingScheduleValidate, updateScheduleController);

module.exports = router;
