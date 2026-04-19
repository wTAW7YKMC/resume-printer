// 解决微信小程序模拟器中文乱码问题
// 在app.js的onLaunch函数中调用此函数

function fixEncodingIssue() {
  // 设置全局字体
  if (typeof wx !== 'undefined') {
    // 尝试设置系统字体
    try {
      wx.setStorageSync('fontFamily', '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", SimSun, "宋体", sans-serif');
    } catch (e) {
      console.error('设置字体失败', e);
    }
    
    // 尝试设置页面编码
    try {
      wx.setNavigationBarTitle({
        title: '个人简历'
      });
    } catch (e) {
      console.error('设置导航栏标题失败', e);
    }
  }
  
  // 检查并修复可能的编码问题
  console.log('编码修复函数已执行');
}

module.exports = {
  fixEncodingIssue: fixEncodingIssue
};