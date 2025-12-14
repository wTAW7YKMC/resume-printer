-- 给sa账号授权resume_message数据库的权限
-- 在SQL Server Management Studio (SSMS) 中执行以下SQL语句

USE resume_message;
GO

-- 如果sa登录名不存在，创建它
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'sa')
BEGIN
    CREATE LOGIN sa WITH PASSWORD = '123456';
    ALTER LOGIN sa ENABLE;
END
ELSE
BEGIN
    -- 如果sa登录名已存在，重置密码并启用
    ALTER LOGIN sa WITH PASSWORD = '123456';
    ALTER LOGIN sa ENABLE;
END
GO

-- 在resume_message数据库中创建对应的用户
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'sa')
BEGIN
    CREATE USER sa FOR LOGIN sa;
END
GO

-- 给sa用户授予db_owner权限
ALTER ROLE db_owner ADD MEMBER sa;
GO

-- 验证权限
SELECT dp.name AS database_user, dp.type_desc AS user_type, 
       sp.name AS server_login, dp.is_fixed_role AS is_fixed_role
FROM sys.database_principals dp
LEFT JOIN sys.server_principals sp ON dp.sid = sp.sid
WHERE dp.name = 'sa';
GO

PRINT 'sa账号已成功授权resume_message数据库的db_owner权限';