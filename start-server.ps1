# 简单的HTTP服务器脚本
$httpListener = New-Object System.Net.HttpListener
$httpListener.Prefixes.Add("http://localhost:8080/")
$httpListener.Start()

Write-Host "服务器已启动，访问 http://localhost:8080/ 查看网站"
Write-Host "按 Ctrl+C 停止服务器"

while ($httpListener.IsListening) {
    $context = $httpListener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    # 获取请求的URL
    $url = $request.Url.LocalPath
    
    # 默认文件
    if ($url -eq "/") {
        $url = "/home.html"
    }
    
    # 构建文件路径
    $filePath = Join-Path (Get-Location) ($url -replace "^/", "")
    
    # 检查文件是否存在
    if (Test-Path $filePath -PathType Leaf) {
        # 获取文件扩展名
        $extension = [System.IO.Path]::GetExtension($filePath)
        
        # 设置内容类型
        switch ($extension) {
            ".html" { $contentType = "text/html; charset=UTF-8" }
            ".css" { $contentType = "text/css" }
            ".js" { $contentType = "application/javascript" }
            ".json" { $contentType = "application/json" }
            ".jpg" { $contentType = "image/jpeg" }
            ".png" { $contentType = "image/png" }
            ".gif" { $contentType = "image/gif" }
            ".ico" { $contentType = "image/x-icon" }
            default { $contentType = "application/octet-stream" }
        }
        
        # 读取文件内容
        $fileContent = [System.IO.File]::ReadAllBytes($filePath)
        
        # 设置响应
        $response.ContentType = $contentType
        $response.ContentLength64 = $fileContent.Length
        $response.StatusCode = 200
        
        # 发送响应
        $response.OutputStream.Write($fileContent, 0, $fileContent.Length)
    } else {
        # 文件不存在，返回404
        $response.StatusCode = 404
        $errorHtml = "<html><body><h1>404 - 文件未找到</h1><p>请求的文件 $url 不存在</p></body></html>"
        $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorHtml)
        
        $response.ContentType = "text/html; charset=UTF-8"
        $response.ContentLength64 = $errorBytes.Length
        $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
    }
    
    $response.Close()
}

$httpListener.Stop()