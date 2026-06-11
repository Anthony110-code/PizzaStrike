import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  laneId: integer("lane_id").notNull(),
  laneNumber: integer("lane_number").notNull(),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  sessionId: text("session_id").notNull(),
  name: text("name"),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
