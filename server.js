const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = 'F:\\数智编程\\resume printer';

const MIME = {
    '.html': 'text/html;charset=utf-8',
    '.css': 'text/css;charset=utf-8',
    '.js': 'application/javascript;charset=utf-8',
    '.json': 'application/json;charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let fp = path.join(ROOT, url === '/' ? 'index.html' : url);
    let ext = path.extname(fp).toLowerCase();
    
    console.log('[' + new Date().toLocaleTimeString() + '] ' + req.method + ' ' + url);

    fs.readFile(fp, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404: ' + url);
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Cache-Control': 'no-cache' });
        res.end(data);
    });
}).listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
