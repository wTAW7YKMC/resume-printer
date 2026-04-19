const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/resume-data.json',
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
    
    // 检查是否是有效的JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('\n✅ JSON数据格式正确');
      console.log(`数据包含 ${Object.keys(jsonData).length} 个顶级键`);
    } catch (error) {
      console.log('\n❌ JSON数据格式错误:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error(`请求错误: ${error.message}`);
});

req.end();