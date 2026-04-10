const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Test-Script/1.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应内容前200个字符:');
    console.log(data.substring(0, 200));
    
    // 检查是否有AccessDenied错误
    if (data.includes('AccessDenied') || data.includes('Current user is in debt')) {
      console.log('\n❌ 发现AccessDenied错误！');
    } else {
      console.log('\n✅ 未发现AccessDenied错误');
    }
  });
});

req.on('error', (error) => {
  console.error(`请求错误: ${error.message}`);
});

req.end();