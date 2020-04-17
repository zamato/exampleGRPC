const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");
 
//Read terminal Lines
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
 
//Load the protobuf
const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("protos/chat.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);
 
const REMOTE_SERVER = "0.0.0.0:5001";
 
let username;
 
//Create gRPC client
let client = new proto.chatpackage.Chat(
  REMOTE_SERVER,
  grpc.credentials.createInsecure()
);
 
//Start the stream between server and client
const startChat = () => {
  let channel = client.join({ user: username });
 
  //wait data from server
  channel.on("data", (message) => {
    if (message.user == username) {
      return
    }
    console.log(`${message.user}: ${message.text}`);
  });
 
  rl.on("line", (text) => {
    //cmd exit
    if (text == 'exit'){
      client.leave({ user: username}, (err, res) => {
        console.log(res.text)
        process.exit()
      })
      return
    }

    //send message to server
    client.send({ user: username, text: text }, (err, res) => {
      console.log(res)
    });
  });
}

//Ask user name then start the chat
rl.question("What's ur name? ", answer => {
  username = answer;
 
  startChat();
});