import { Request, Response, NextFunction } from "express";
import messageService from "../services/message.service";
import { emitToUser } from "../socket";
import { BookingModel } from "../models/Booking";

export class MessageController {
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const userRole = (req as any).user?.role;

      const message = await messageService.send({
        bookingId: req.params.bookingId,
        senderId: userId,
        senderModel: userRole === 'deliveryman' ? 'Driver' : 'User',
        content: req.body.content,
      });

      if (!message) {
        return res.status(400).json({ success: false, error: "Mensagem não enviada" });
      }

      const booking = await BookingModel.findById(req.params.bookingId);
      if (booking) {
        const otherUserId = userRole === 'deliveryman'
          ? booking.client.toString()
          : booking.driver?.toString();

        if (otherUserId) {
          emitToUser(otherUserId, "chat:new_message", {
            bookingId: booking._id,
            message,
          });
        }
      }

      return res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  async getByBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await messageService.getByBooking(
        req.params.bookingId,
        req.query as any
      );

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      await messageService.markAsRead(req.params.bookingId, userId);
      return res.status(200).json({ success: true, data: { marked: true } });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id;
      const result = await messageService.getUnreadCount(req.params.bookingId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
