import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from './utils/api';

// 导入页面组件
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import UserItemsPage from './pages/UserItemsPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';

// 导入公共组件
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 获取当前用户信息，实现自动根据IP登录
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // 直接调用后端API，后端会自动根据IP创建或查找用户
        // ipAuth中间件会处理用户的自动创建逻辑
        const response = await api.get('/api/users/me');
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error('获取用户信息失败，尝试重新获取:', error);
        // 重试一次，确保后端有机会创建用户
        setTimeout(async () => {
          try {
            const retryResponse = await api.get('/api/users/me');
            setCurrentUser(retryResponse.data.data);
          } catch (retryError) {
            console.error('重试失败，使用临时用户:', retryError);
            // 如果两次都失败，才使用临时用户对象
            const tempUser = {
              id: 'temp',
              ip: 'local-ip',
              name: '访客',
              status: 'active'
            };
            setCurrentUser(tempUser);
          } finally {
            setLoading(false);
          }
        }, 1000);
        // 注意：这里不立即设置loading为false，而是在重试完成后设置
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 如果用户未设置工号，跳转到设置页面
  useEffect(() => {
    if (currentUser && !currentUser.employee_id && window.location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/test-user-items" element={<UserItemsPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/user/:userId" element={<UserItemsPage />} />
          <Route path="/add" element={<AddItemPage currentUser={currentUser} />} />
          <Route path="/edit/:id" element={<EditItemPage currentUser={currentUser} />} />
          <Route path="/profile" element={
            <div className="container">
              <h2>完善个人信息后方可继续使用平台</h2>
              <ProfileForm currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

// 个人信息表单组件
function ProfileForm({ currentUser, setCurrentUser }) {
  const [formData, setFormData] = useState({
    employee_id: currentUser?.employee_id || '',
    name: currentUser?.name || ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/api/users/me', formData);
      setCurrentUser(response.data.data);
      setMessage('个人信息更新成功');
      // 如果有工号，跳转到首页
      if (formData.employee_id) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('更新失败:', error);
      setMessage('更新失败，请重试');
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {message && <div className="message">{message}</div>}
      
      <div className="form-group">
        <label htmlFor="employee_id">工号 <span className="required">*</span></label>
        <input
          type="text"
          id="employee_id"
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          required
          placeholder="请输入您的工号"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="name">姓名 <span className="required">*</span></label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          required
          onChange={handleChange}
          placeholder="请输入您的姓名（选填）"
        />
      </div>
      
      <div className="form-group">
        <label>IP地址</label>
        {currentUser.ip_addresses && currentUser.ip_addresses.length > 0 ? (
          <div className="ip-addresses-list">
            {currentUser.ip_addresses.map((ipObj, index) => {
              // 格式化创建时间
              const formattedTime = ipObj.created_at 
                ? new Date(ipObj.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';
              
              return (
                <div key={index} className="ip-address-item">
                  <input
                    type="text"
                    value={ipObj.ip}
                    readOnly
                    className="readonly"
                  />
                  {formattedTime && (
                    <small className="ip-time">添加时间: {formattedTime}</small>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={currentUser.ip || ''}
            readOnly
            className="readonly"
            placeholder="未获取到IP地址"
          />
        )}
      </div>
      
      <button type="submit" className="btn btn-primary">保存信息</button>
    </form>
  );
}

export default App;