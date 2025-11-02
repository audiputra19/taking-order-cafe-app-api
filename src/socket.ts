import { Server } from 'socket.io';
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: { origin: '*' },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${socket.id} | Reason: ${reason}`);
        });
    });

    return io;
}

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");

    return io;
}