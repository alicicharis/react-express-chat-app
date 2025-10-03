export type Message = {
  id: string;
  content: string;
  roomId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};
