// 合伙人移动端应用 JavaScript

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 添加触摸反馈效果
  addTouchFeedback();
  
  // 初始化底部导航栏
  initTabBar();
  
  // 根据当前页面设置导航栏状态
  const currentPage = getCurrentPage();
  updateTabBar(currentPage);

  // 检查是否已登录
  checkLoginStatus();

  // 初始化长者模式
  initElderMode();

  // 初始化消息通知
  initNotifications();
});

// 添加触摸反馈效果
function addTouchFeedback() {
  const touchElements = document.querySelectorAll('.touch-friendly');
  touchElements.forEach(element => {
    // 跳过有 no-scale 类的元素
    if (element.classList.contains('no-scale')) {
      element.addEventListener('touchstart', function() {
        this.style.opacity = '0.7';
      });
      
      element.addEventListener('touchend', function() {
        this.style.opacity = '1';
      });
      
      element.addEventListener('touchcancel', function() {
        this.style.opacity = '1';
      });
    } else {
      element.addEventListener('touchstart', function() {
        this.style.opacity = '0.7';
        this.style.transform = 'scale(0.98)';
      });
      
      element.addEventListener('touchend', function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
      });
      
      element.addEventListener('touchcancel', function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
      });
    }
  });
}

// 获取当前页面名称
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '');
  return page || 'login';
}

// 初始化底部导航栏
function initTabBar() {
  // 为每个导航项添加点击事件
  const tabItems = document.querySelectorAll('.nav-item');
  tabItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) {
        navigateToPage(page);
      }
    });
  });
}

// 更新底部导航栏状态
function updateTabBar(activePage) {
  const tabItems = document.querySelectorAll('.nav-item');
  tabItems.forEach(item => {
    const page = item.getAttribute('data-page');
    if (page === activePage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 页面跳转
function navigateToPage(page) {
  // 小程序中应使用 wx.navigateTo
  if (typeof wx !== 'undefined') {
    wx.navigateTo({
      url: `/${page}/${page}`
    });
  } else {
    // Web端跳转
    let url = '';
    switch(page) {
      case 'order':
        url = 'order.html';
        break;
      case 'device':
        url = 'device.html';
        break;
      case 'report':
        url = 'report.html';
        break;
      case 'profile':
        url = 'profile.html';
        break;
      case 'order-shooting':
        url = 'order-shooting.html';
        break;
      default:
        url = `${page}.html`;
    }
    window.location.href = url;
  }
  
  // 记录用户行为（小程序分析）
  if (typeof wx !== 'undefined') {
    wx.reportAnalytics('page_visit', {
      page: page,
      timestamp: Date.now()
    });
  }
}

// 检查登录状态
function checkLoginStatus() {
  const isLoginPage = getCurrentPage() === 'login';
  const token = localStorage.getItem('partner_token');
  
  if (!token && !isLoginPage) {
    // 未登录且不在登录页，跳转到登录页
    window.location.href = 'login.html';
  } else if (token && isLoginPage) {
    // 已登录且在登录页，跳转到订单页
    window.location.href = 'order.html';
  }
}

// 登录函数
function login(phone, password, type = 'password') {
  showLoading();
  
  // 模拟登录请求
  setTimeout(() => {
    hideLoading();
    
    // 模拟成功登录
    localStorage.setItem('partner_token', 'sample_token_123456');
    localStorage.setItem('partner_phone', phone);
    
    // 跳转到订单页
    window.location.href = 'order.html';
  }, 1000);
}

// 退出登录
function logout() {
  showConfirm('退出登录', '确定要退出登录吗？', function() {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_phone');
    localStorage.removeItem('elder_mode');
    window.location.href = 'login.html';
  });
}

// 初始化长者模式
function initElderMode() {
  const elderMode = localStorage.getItem('elder_mode') === 'true';
  if (elderMode) {
    document.body.classList.add('elder-mode');
  } else {
    document.body.classList.remove('elder-mode');
  }
}

// 切换长者模式
function toggleElderMode() {
  const elderMode = localStorage.getItem('elder_mode') === 'true';
  localStorage.setItem('elder_mode', !elderMode);
  
  if (!elderMode) {
    document.body.classList.add('elder-mode');
    showToast('已开启长者模式');
  } else {
    document.body.classList.remove('elder-mode');
    showToast('已关闭长者模式');
  }
}

// 初始化消息通知
function initNotifications() {
  // 在实际小程序中，这里应该连接到消息推送服务
  console.log('初始化消息通知');
}

// 显示加载状态
function showLoading() {
  // 小程序中应使用 wx.showLoading
  if (typeof wx !== 'undefined') {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  } else {
    // Web端加载
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.innerHTML = '<div class="loading-container"><div class="loading"></div><div class="loading-text">加载中...</div></div>';
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    document.body.appendChild(loading);
  }
}

// 隐藏加载状态
function hideLoading() {
  // 小程序中应使用 wx.hideLoading
  if (typeof wx !== 'undefined') {
    wx.hideLoading();
  } else {
    // Web端隐藏
    const loading = document.getElementById('global-loading');
    if (loading) {
      loading.remove();
    }
  }
}

// 显示提示信息
function showToast(message, type = 'success') {
  // 小程序中应使用 wx.showToast
  if (typeof wx !== 'undefined') {
    wx.showToast({
      title: message,
      icon: type === 'error' ? 'none' : type,
      duration: 2000
    });
  } else {
    // Web端提示
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 4px;
      z-index: 10000;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }
}

// 确认对话框
function showConfirm(title, content, confirmCallback, cancelCallback) {
  // 小程序中应使用 wx.showModal
  if (typeof wx !== 'undefined') {
    wx.showModal({
      title: title,
      content: content,
      success: function(res) {
        if (res.confirm) {
          confirmCallback && confirmCallback();
        } else if (res.cancel) {
          cancelCallback && cancelCallback();
        }
      }
    });
  } else {
    // Web端确认
    if (confirm(content)) {
      confirmCallback && confirmCallback();
    } else {
      cancelCallback && cancelCallback();
    }
  }
}

// 拨打电话
function makePhoneCall(phoneNumber) {
  // 小程序中应使用 wx.makePhoneCall
  if (typeof wx !== 'undefined') {
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  } else {
    window.open(`tel:${phoneNumber}`);
  }
}

// 扫码功能
function scanQRCode(callback) {
  // 小程序中应使用 wx.scanCode
  if (typeof wx !== 'undefined') {
    wx.scanCode({
      success: function(res) {
        callback && callback(res.result);
      },
      fail: function() {
        showToast('扫码失败', 'error');
      }
    });
  } else {
    // Web端模拟
    const code = prompt('请输入订单号（Web端模拟扫码）');
    if (code) {
      callback && callback(code);
    }
  }
}

// 更新订单状态
function updateOrderStatus(orderId, status, callback) {
  showLoading();
  
  // 模拟API请求
  setTimeout(() => {
    hideLoading();
    showToast('订单状态已更新');
    callback && callback();
  }, 1000);
}

// 获取无人机状态
function getDroneStatus(droneId, callback) {
  // 模拟API请求
  setTimeout(() => {
    // 模拟状态：online, low-battery, offline
    const statuses = ['online', 'low-battery', 'offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    callback && callback(randomStatus);
  }, 500);
}

// 播放语音提醒
function playVoiceAlert(message) {
  // 小程序中应使用相应API
  if (typeof wx !== 'undefined' && wx.createInnerAudioContext) {
    // 实际应用中应使用文字转语音API
    console.log('播放语音提醒:', message);
  } else {
    // Web端模拟
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = 'zh-CN';
      speechSynthesis.speak(speech);
    } else {
      console.log('播放语音提醒:', message);
    }
  }
} 