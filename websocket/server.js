const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3000 })

wss.on('connection', ws => {
    console.log('有帅哥连接进来了')

    ws.on('message', data => {
        ws.send(data + '疑是地上霜')
    })

    ws.on('close', ws => {
        console.log('帅哥走了，呜呜呜～')
    })
})


