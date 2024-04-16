const { Server } = require("socket.io");


const ACTIONS = {
    JOIN: "join",
    JOINED: "joined",
    DISCONNECTED: "disconnected",
    CODE_CHANGE: "code-change",
    SYNC_CODE: "sync-code",
    LEAVE: "leave",
  };

  const createSocketServer = (server) => {

const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET,POST,PUT,DELETE"],
    },
  });
  const UserSocketMap = {};
  
  function getAllConnectedClients(RoomId) {
    return Array.from(io.sockets.adapter.rooms.get(RoomId) || []).map(
      (socketID) => {
        return {
          socketID,
          UserName: UserSocketMap[socketID],
        };
      }
    );
  }
  
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
  
    socket.on(ACTIONS.JOIN, ({ RoomId, UserName }) => {
      // console.log("join", RoomId, UserName);
      UserSocketMap[socket.id] = UserName;
      socket.join(RoomId);
      const clients = getAllConnectedClients(RoomId);
      // console.log({ clients });
      clients.forEach(({ socketID }) => {
        io.to(socketID).emit(ACTIONS.JOINED, {
          clients,
          UserName: UserName,
          socketID: socket.id,
        });
      });
    });
  
    socket.on(ACTIONS.CODE_CHANGE, ({ RoomId, code, linenumber }) => {
      // console.log({{code, linenumber});
      socket
        .in(RoomId)
        .emit(ACTIONS.CODE_CHANGE, {
          code,
          linenumber,
          UserName: UserSocketMap[socket.id],
        });
    });
  
    socket.on(ACTIONS.SYNC_CODE, ({ code, socketID }) => {
      // console.log({socketID,code});
      io.to(socketID).emit(ACTIONS.CODE_CHANGE, { code, linenumber: 10000 });
    });
  
    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((RoomId) => {
        socket.in(RoomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          UserName: UserSocketMap[socket.id],
        });
      });
      delete UserSocketMap[socket.id];
      socket.leave();
    });
  });
}

  module.exports = createSocketServer;