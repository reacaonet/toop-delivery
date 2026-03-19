const router = require("express").Router();

/** middleware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** controllers */
const ReportAdmRaces = require("../../../controllers/Mobility/report/adm/driver/ReportRacesController");
const BalanceRaces = require("../../../controllers/Mobility/report/adm/driver/balanceRacesController");

const PaginatorReportPassenger = require("../../../controllers/Mobility/report/adm/passenger/PaginatorPassenger");
const BalanceReportPassenger = require("../../../controllers/Mobility/report/adm/passenger/BalancePassenger");

const PaginatorRaces = require("../../../controllers/Mobility/report/adm/races/PaginatorRaces");
const Balances = require("../../../controllers/Mobility/report/adm/races/BalanceRaces");

const PaginatorDriver = require("../../../controllers/Mobility/report/adm/driver/PaginatorDriverController");

/** Map */
const MapListBooking = require("../../../controllers/Mobility/report/adm/monitoring/ListBookingController");
const ActiveMonitoring = require("../../../controllers/Mobility/report/adm/monitoring/ActiveMonitoringController");

router.get("/adm/driver", auth, checkFranchises, ReportAdmRaces);
router.get("/adm/driver/balance", auth, checkFranchises, BalanceRaces);

router.get("/adm/passenger", auth, checkFranchises, PaginatorReportPassenger);
router.get("/adm/passenger/balance", auth, checkFranchises, BalanceReportPassenger);

router.get("/adm/races", auth, checkFranchises, PaginatorRaces);
router.get("/adm/races/balance", auth, checkFranchises, Balances);

router.get("/driver", auth, checkFranchises, PaginatorDriver);

router.get("/map/monitoring", auth, checkFranchises, MapListBooking);

router.get("/active/monitoring", auth, checkFranchises, ActiveMonitoring);

module.exports = router;
