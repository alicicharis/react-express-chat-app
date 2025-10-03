import { eq } from "drizzle-orm";
import { db } from ".";
import { messages, room_members, rooms } from "./schema";

export const getUserRooms = async (userId: string) => {
  const roomsData = await db
    .select({ room: rooms })
    .from(room_members)
    .innerJoin(rooms, eq(room_members.roomId, rooms.id))
    .where(eq(room_members.userId, userId));

  const mappedData = roomsData.map((room) => room.room);

  return mappedData;
};

export const getChatMessages = async (roomId: string) => {
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.roomId, roomId));

  return chatMessages;
};
