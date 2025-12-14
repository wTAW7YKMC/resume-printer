-- 配置SQL Server身份验证和sa账号脚本
-- 请在SQL Server Management Studio (SSMS)中执行此脚本

-- 步骤1：启用SQL Server身份验证模式
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer', 
    N'LoginMode', REG_DWORD, 2
GO

-- 步骤2：启用sa账号并设置密码
ALTER LOGIN sa ENABLE;
GO
ALTER LOGIN sa WITH PASSWORD = '123456';
GO

-- 步骤3：检查sa账号状态
SELECT name, is_disabled, 
       CASE WHEN is_policy_checked = 1 THEN '是' ELSE '否' END AS is_policy_checked
FROM sys.sql_logins 
WHERE name = 'sa';
GO

-- 步骤4：创建resume_message数据库（如果不存在）
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'resume_message')
BEGIN
    CREATE DATABASE resume_message;
    PRINT '已创建resume_message数据库';
END
ELSE
BEGIN
    PRINT 'resume_message数据库已存在';
END
GO

-- 步骤5：在resume_message数据库中创建用户和授权
USE resume_message;
GO

-- 创建数据库用户（如果不存在）
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'sa')
BEGIN
    CREATE USER sa FOR LOGIN sa;
    PRINT '已在resume_message数据库中创建sa用户';
END
ELSE
BEGIN
    PRINT 'resume_message数据库中的sa用户已存在';
END
GO

-- 授予db_owner权限
ALTER ROLE db_owner ADD MEMBER sa;
PRINT '已授予sa用户db_owner权限';
GO

-- 步骤6：创建message表（如果不存在）
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='message' AND xtype='U')
BEGIN
    CREATE TABLE message (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(50) NOT NULL,
        email NVARCHAR(100) NOT NULL,
        content NVARCHAR(500) NOT NULL,
        createTime DATETIME DEFAULT GETDATE()
    );
    PRINT '已创建message表';
END
ELSE
BEGIN
    PRINT 'message表已存在';
END
GO

PRINT '=====================================';
PRINT '配置完成！';
PRINT '请重启SQL Server服务以使身份验证模式更改生效';
PRINT '然后可以运行Java应用程序测试连接';
PRINT '=====================================';