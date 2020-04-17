const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
 
const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:5001";
 
// Load protobuf
const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("protos/chat.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);
 
let users = {};
 
// Receive message from client joining
const join = (call) => {
  users[call.request.user] = call

  notifyChat({ user: "Server", text: `${call.request.user} is joined` });
}
 
// Receive message from client
const send = (call, callback) => {
  notifyChat(call.request);
  // callback(null, {user: 'big', text: 'send complete'})
}

const leave = (call, callback) => {
  notifyChat({ user: "Server", text: `${call.request.user} is leave` });
  leaveRoom(call.request.user)
  callback(null, {user: 'Server', text: 'leave complete'})
}
 
// Send message to all connected clients
const notifyChat = (message) => {
  for (const username in users) {
    users[username].write(message);
  }
}

const leaveRoom = (username) => {
  users[username].end()
  console.log('remove', username)
  delete users[username]
}
 
// Define server with the methods and start it
server.addService(proto.chatpackage.Chat.service, { join, send, leave });
 
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
 
server.start();