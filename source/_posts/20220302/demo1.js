const http = require('http')
function updateTime() {
    setInterval(() => this.time = new Date().toUTCString(), 1000)
    return this.time
}

http.createServer((req, res) => {
    console.log('url:', `${req.method} ${req.url} `)

    const { url } = req
    if ('/index.html' === url) {
        res.end(`
            <html>
                Html Update Time: ${updateTime()}
                <script src='main.js'></script>
            </html>
            `)
    } else if (url === '/main.js') {
        const content = `document.writeln('<br>JS   Update Time:${updateTime()}')`
        res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toUTCString())
        res.statusCode = 200
        res.end(content)
    } else if (url === '/favicon.ico') {
        res.end('')
    }
})
    .listen(9527, () => {
        console.log('Http Cache Test at:' + 9527)
    })
