const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
    "./protos/example.proto",
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })
const sendMessageProto = grpc.loadPackageDefinition(packageDefinition).sendMessagePackage

const main = async () => {
  const client = new sendMessageProto.SendMessage('localhost:50051',
    grpc.credentials.createInsecure()
  );

  //============ send normal request ============================
//   client.sayHello({name: 'you'}, (err, response) => {
//     console.log(response)
//   });


  //============ recive data form server only ===================
//   let call = client.SendMessageToClientOnly();
//   call.on('data', (data)=> {
//     console.log('getdata', data)
//   })
//   call.on('end', () => {
//     console.log('connecttionlost')
//   })

  // =========== send data from server only ====================
  // let callServer = client.SendMessageToServerOnly((error)=>{
  //   console.log(error)
  // });

  // callServer.write({message: 'test1'})
  // callServer.write({message: 'test2'})
  // callServer.end()

  //============ 2 way connection =============================
  let call2Way = client.TwoWaySendMessage()
  call2Way.on('data', (data)=>{
    console.log('call2Way form Server', data)
  })
  call2Way.on('end', ()=>{
    console.log('end call2Way form Server')
  })

  call2Way.write({message: 'test send data form client'})
//   call2Way.end()

}

main()
