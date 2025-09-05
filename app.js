// 全局应用配置
const appConfig = {
    baseUrl: '', // API基础URL
    debug: true, // 调试模式
    version: '1.0.0' // 应用版本
};

// 页面导航函数
function navigateToPage(pageUrl, params = {}) {
    // 构建带参数的URL
    let url = pageUrl;
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    
    if (queryString) {
        url += '?' + queryString;
    }
    
    // 记录页面访问（用于统计）
    logPageVisit(pageUrl, params);
    
    // 执行页面跳转
    window.location.href = url;
}

// 页面访问日志
function logPageVisit(pageUrl, params = {}) {
    if (appConfig.debug) {
        console.log(`[PAGE VISIT] ${pageUrl}`, params);
    }
    
    // 在微信小程序环境中，可以调用微信的统计API
    if (typeof wx !== 'undefined') {
        try {
            wx.reportAnalytics('page_visit', {
                page: pageUrl,
                timestamp: Date.now(),
                params: JSON.stringify(params)
            });
        } catch (error) {
            console.error('Report analytics failed:', error);
        }
    }
}

// 显示提示信息（Toast）
function showToast(message, duration = 2000, type = 'info') {
    // 移除之前的toast
    const oldToast = document.getElementById('app-toast');
    if (oldToast) {
        oldToast.remove();
    }
    
    // 创建新的toast元素
    const toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed left-1/2 top-1/4 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/70 text-white text-sm z-50 transition-all duration-300';
    
    // 根据类型设置不同的图标和样式
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fa fa-check-circle mr-2"></i>';
            break;
        case 'error':
            icon = '<i class="fa fa-times-circle mr-2"></i>';
            break;
        case 'warning':
            icon = '<i class="fa fa-exclamation-circle mr-2"></i>';
            break;
        default:
            icon = '<i class="fa fa-info-circle mr-2"></i>';
    }
    
    toast.innerHTML = icon + message;
    document.body.appendChild(toast);
    
    // 设置动画效果
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // 定时移除toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// 显示加载提示（Loading）
function showLoading(message = '加载中...') {
    // 移除之前的loading
    const oldLoading = document.getElementById('app-loading');
    if (oldLoading) {
        oldLoading.remove();
    }
    
    // 创建新的loading元素
    const loading = document.createElement('div');
    loading.id = 'app-loading';
    loading.className = 'fixed inset-0 flex items-center justify-center bg-black/30 z-50';
    loading.innerHTML = `
        <div class="bg-white p-4 rounded-lg flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(loading);
}

// 隐藏加载提示
function hideLoading() {
    const loading = document.getElementById('app-loading');
    if (loading) {
        loading.remove();
    }
}

// 请求API的通用方法
async function requestApi(url, method = 'GET', data = {}, headers = {}) {
    // 显示加载提示
    showLoading();
    
    try {
        // 构建完整的URL
        const fullUrl = appConfig.baseUrl + url;
        
        // 构建fetch选项
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        // 如果是POST、PUT等方法，添加请求体
        if (method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(data);
        }
        
        // 发送请求
        const response = await fetch(fullUrl, options);
        
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 解析响应数据
        const result = await response.json();
        
        // 隐藏加载提示
        hideLoading();
        
        return result;
    } catch (error) {
        // 隐藏加载提示
        hideLoading();
        
        // 显示错误提示
        showToast(`请求失败：${error.message}`, 3000, 'error');
        
        // 记录错误日志
        if (appConfig.debug) {
            console.error(`[API ERROR] ${url}:`, error);
        }
        
        throw error;
    }
}

// 存储数据到本地
function setStorage(key, value) {
    try {
        if (typeof wx !== 'undefined') {
            // 在微信小程序环境中
            wx.setStorageSync(key, value);
        } else {
            // 在浏览器环境中
            localStorage.setItem(key, JSON.stringify(value));
        }
        return true;
    } catch (error) {
        console.error(`Set storage ${key} failed:`, error);
        return false;
    }
}

// 从本地读取数据
function getStorage(key, defaultValue = null) {
    try {
        let value;
        
        if (typeof wx !== 'undefined') {
            // 在微信小程序环境中
            value = wx.getStorageSync(key);
        } else {
            // 在浏览器环境中
            const storedValue = localStorage.getItem(key);
            value = storedValue ? JSON.parse(storedValue) : null;
        }
        
        return value !== undefined && value !== null ? value : defaultValue;
    } catch (error) {
        console.error(`Get storage ${key} failed:`, error);
        return defaultValue;
    }
}

// 从本地删除数据
function removeStorage(key) {
    try {
        if (typeof wx !== 'undefined') {
            // 在微信小程序环境中
            wx.removeStorageSync(key);
        } else {
            // 在浏览器环境中
            localStorage.removeItem(key);
        }
        return true;
    } catch (error) {
        console.error(`Remove storage ${key} failed:`, error);
        return false;
    }
}

// 清空所有本地数据
function clearStorage() {
    try {
        if (typeof wx !== 'undefined') {
            // 在微信小程序环境中
            wx.clearStorageSync();
        } else {
            // 在浏览器环境中
            localStorage.clear();
        }
        return true;
    } catch (error) {
        console.error('Clear storage failed:', error);
        return false;
    }
}

// 获取用户信息
function getUserInfo() {
    return getStorage('userInfo', null);
}

// 设置用户信息
function setUserInfo(userInfo) {
    return setStorage('userInfo', userInfo);
}

// 检查用户是否已登录
function isLoggedIn() {
    const userInfo = getUserInfo();
    return userInfo !== null;
}

// 获取token
function getToken() {
    return getStorage('token', null);
}

// 设置token
function setToken(token) {
    return setStorage('token', token);
}

// 格式化日期时间
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 格式化金额
function formatMoney(amount, decimals = 2) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    
    return '¥' + amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 数字千分位格式化
function formatNumber(num) {
    if (typeof num !== 'number') {
        num = parseFloat(num) || 0;
    }
    
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 初始化应用
function initApp() {
    // 检查用户登录状态
    if (!isLoggedIn()) {
        // 如果用户未登录，跳转到登录页面
        // 注意：这里不直接跳转，因为登录页面是入口页面
        // navigateToPage('login.html');
    }
    
    // 添加全局错误处理
    window.addEventListener('error', (event) => {
        if (appConfig.debug) {
            console.error('[GLOBAL ERROR]:', event.error);
        }
        // 可以在这里上报错误到服务器
    });
    
    // 添加网络状态监听
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            showToast('网络已连接', 2000, 'success');
        });
        
        window.addEventListener('offline', () => {
            showToast('网络已断开', 2000, 'warning');
        });
    }
}

// 模块导出
if (typeof window !== 'undefined') {
    // 在浏览器环境中，挂载到window对象上，方便直接调用
    window.app = {
        navigateToPage,
        logPageVisit,
        showToast,
        showLoading,
        hideLoading,
        requestApi,
        setStorage,
        getStorage,
        removeStorage,
        clearStorage,
        getUserInfo,
        setUserInfo,
        isLoggedIn,
        getToken,
        setToken,
        formatDateTime,
        formatMoney,
        formatNumber,
        debounce,
        throttle,
        initApp,
        config: appConfig
    };
    
    // 初始化应用
    document.addEventListener('DOMContentLoaded', () => {
        window.app.initApp();
    });
}

// 默认导出
// 注意：这个文件在浏览器中直接使用script标签引入时，不需要导出
// 但为了支持模块导入方式，保留以下导出语句
// export default {
//     navigateToPage,
//     logPageVisit,
//     showToast,
//     showLoading,
//     hideLoading,
//     requestApi,
//     setStorage,
//     getStorage,
//     removeStorage,
//     clearStorage,
//     getUserInfo,
//     setUserInfo,
//     isLoggedIn,
//     getToken,
//     setToken,
//     formatDateTime,
//     formatMoney,
//     formatNumber,
//     debounce,
//     throttle,
//     initApp,
//     config: appConfig
// };