// 简单的API测试脚本
async function testAPI() {
    console.log('开始测试API...');
    
    try {
        // 1. 测试基本连接
        console.log('1. 测试基本连接...');
        const basicResponse = await fetch('https://message-server-uutepmlola.cn-hangzhou.fcapp.run/');
        const basicText = await basicResponse.text();
        console.log('基本连接响应状态:', basicResponse.status);
        console.log('基本连接响应内容:', basicText);
        
        // 2. 测试留言列表API
        console.log('2. 测试留言列表API...');
        const listResponse = await fetch('https://message-server-uutepmlola.cn-hangzhou.fcapp.run/api/resume/message/list');
        console.log('留言列表API响应状态:', listResponse.status);
        
        if (listResponse.ok) {
            const listData = await listResponse.json();
            console.log('留言列表数据:', listData);
        } else {
            const errorText = await listResponse.text();
            console.log('留言列表API错误响应:', errorText);
        }
        
        // 3. 测试提交留言API
        console.log('3. 测试提交留言API...');
        const submitResponse = await fetch('https://message-server-uutepmlola.cn-hangzhou.fcapp.run/api/resume/message/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: '测试用户',
                email: 'test@example.com',
                content: '这是一条测试留言'
            })
        });
        
        console.log('提交留言API响应状态:', submitResponse.status);
        
        if (submitResponse.ok) {
            const submitData = await submitResponse.json();
            console.log('提交留言API响应数据:', submitData);
        } else {
            const errorText = await submitResponse.text();
            console.log('提交留言API错误响应:', errorText);
        }
        
    } catch (error) {
        console.error('API测试出错:', error);
    }
}

// 运行测试
testAPI();