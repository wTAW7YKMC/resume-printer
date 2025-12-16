-- SQL Server 2022 建表语句
-- 数据库: resume_message
-- 表名: message

USE resume_message;
GO

-- 如果表已存在，先删除
IF OBJECT_ID('dbo.message', 'U') IS NOT NULL
    DROP TABLE dbo.message;
GO

-- 创建message表
CREATE TABLE dbo.message
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    content NVARCHAR(500) NOT NULL,
    createTime DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- 添加索引以提高查询性能
CREATE INDEX idx_message_createTime ON dbo.message(createTime DESC);
GO

-- 添加注释（SQL Server 2022 使用扩展属性）
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'留言表', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'主键ID', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message', 
    @level2type = N'COLUMN', @level2name = N'id';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'留言者姓名', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message', 
    @level2type = N'COLUMN', @level2name = N'name';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'留言者邮箱', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message', 
    @level2type = N'COLUMN', @level2name = N'email';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'留言内容', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message', 
    @level2type = N'COLUMN', @level2name = N'content';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'创建时间', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'message', 
    @level2type = N'COLUMN', @level2name = N'createTime';
GO

-- 插入测试数据（可选）
INSERT INTO dbo.message (name, email, content) VALUES 
(N'张三', N'zhangsan@example.com', N'这是一个测试留言，网站很棒！'),
(N'李四', N'lisi@example.com', N'希望能与您进一步交流。'),
(N'王五', N'wangwu@example.com', N'您的简历网站设计得很有特色。');
GO

-- 查询验证
SELECT * FROM dbo.message ORDER BY createTime DESC;
GO