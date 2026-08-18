const { Types } = require("mongoose");
/** Model */
const BookingModel = require("../../../../models/Mobility/Booking/BookingModel");
const PersonModel = require("../../../../models/Person/PersonModel");
const DriverModel = require("../../../../models/Mobility/Driver/DriverModel");
/** Service */
const apiPushNotification = require("../../../../services/notification");

const updateScheduleController = async (request, reply) => {
  try {
    const { id, ...updateData } = request.body;

    const booking = await BookingModel.findOne({
      _id: id,
      status: "scheduled",
    })
      .populate("application driver")
      .lean();

    if (!booking) {
      return reply.status(400).send({
        message: "por favor Insira as informações",
      });
    }

    if (updateData.driverId) {
      updateData.driver = new Types.ObjectId(updateData.driverId);
      delete updateData.driverId;
    }

    if (updateData.passenger) {
      if (updateData.createPassenger && !Types.ObjectId.isValid(updateData.passenger)) {
        const person = await PersonModel.create({
          name: updateData.passenger,
          franchise: booking.franchise,
        });

        const passeger = await PassegerModel.create({
          person: person._id,
          franchise: booking.franchise,
        });

        updateData.passenger = passeger._id;
      } else {
        updateData.passenger = new Types.ObjectId(updateData.passenger);
      }
    }

    if (updateData.origin) {
      updateData.origin = {
        address: updateData.origin.address ? updateData.origin.address : "",
        type: "Point",
        coordinates: [Number(updateData.origin.longitude), Number(updateData.origin.latitude)],
      };
    }

    if (updateData.destiny) {
      const destinyCreate = [];

      for (const item of updateData.destiny) {
        destinyCreate.push({
          type: "Point",
          address: item.address ? item.address : "",
          coordinates: [Number(item.longitude), Number(item.latitude)],
        });

        updateData.destiny = destinyCreate;
      }
    }

    if (updateData.additionalStops) {
      const additionalStopsCreate = [];

      // additionalStops
      for (const item of updateData.additionalStops) {
        additionalStopsCreate.push({
          type: "Point",
          address: item.address ? item.address : "",
          coordinates: [Number(item.longitude), Number(item.latitude)],
        });
      }

      updateData.additionalStops;
    }

    const bookingResponse = await BookingModel.updateOne({ _id: id }, updateData);

    if (!updateData.driver || (updateData.driver && updateData.driver.toString() == booking.driver._id.toString())) {
      await sendPushNotification(booking.driver.token, "Alteração em agendamento", "Acabou de ocorrer uma alteração em uma corrida agendada");
    } else {
      const driver = await DriverModel.findById(updateData.driver);

      if (driver) {
        await sendPushNotification(driver.token, "Nova corrida agendada", "Uma corrida foi alterada para você, venha conferir!");
      }

      await sendPushNotification(booking.driver.token, "Cancelamento de corrida", "Uma corrida agendada foi cancelada!");
    }

    return reply.send({
      message: "Sucesso",
      booking: bookingResponse,
    });
  } catch (err) {
    return reply.status(400).send({
      err: err.message,
      message: "Não foi possível atualizar agendamento",
    });
  }
};

const sendPushNotification = async (token, title, message) => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: message,
        auth: token,
      },
      params: {
        title: title,
        message: message,
      },
    });
  } catch (err) {
    return;
  }
};

module.exports = updateScheduleController;
