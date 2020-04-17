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

const sayHello = (call, callback) => {
  callback(null, {
      id:12,
      type: 1,
      message: 'Hello ' + call.request.name,
      listObj: [
        {
          id:1
        },
        {
          id:2
        }
      ],
      list: [
        1,2
      ]
    }
  )
}

const SendMessageToServerOnly = (call) => {
  call.on('data', (data)=> {
    console.log('getdata', data)
  })
  call.on('end', (data) => {
    console.log('connecttionlost', data)
  })
}

const SendMessageToClientOnly = (call) => {
  call.write({id:1, message: 'asdadasdadds'})

  setInterval(()=>{
    call.write({id:1, message: Date.now().toString()})
  }, 1000)

  //this is for end connection
  // call.end()

}

const TwoWaySendMessage = (call) => {
  call.on('data', (data)=> {
    console.log('getdata', data)
  })
  call.on('end', () => {
    console.log('connecttionlost')
  })

  call.write({message: 'test send data form server'})
 //this is for end connection
  // call.end()
}

(() => {
  const server = new grpc.Server()
  server.addService(
    sendMessageProto.SendMessage.service,
    {
      sayHello,
      SendMessageToServerOnly,
      SendMessageToClientOnly,
      TwoWaySendMessage,
    }
  )
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
  server.start()
})()