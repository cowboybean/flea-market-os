import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

function UserItemsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // All state hooks must be declared at the top before any conditional logic
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [activeTab, setActiveTab] = useState('sell'); // 'sell' 或 'buy'
  
  // 临时用于测试的用户ID（可以替换为实际存在的用户ID）
  const testUserId = '1';

  // 获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/api/users/me');
        setCurrentUser(response.data.data);
      } catch (err) {
        console.error('获取用户信息失败:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  // 获取用户的物品
  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        setLoading(true);
        // 如果没有userId参数，使用测试用户ID或当前用户ID
        const targetUserId = userId || testUserId || (currentUser && (currentUser.id));
        console.log('尝试获取用户物品，用户ID:', targetUserId);
        const response = await api.get(`/api/items/user/${targetUserId}`);
        console.log('获取用户物品成功:', response.data);
        setItems(response.data.data);
      } catch (err) {
        console.error('获取用户物品失败:', err.response?.data || err.message || err);
        setError('获取用户物品失败，请稍后重试。错误详情已在控制台显示。');
      } finally {
        setLoading(false);
      }
    };
    fetchUserItems();
  }, [userId, testUserId, currentUser]);

  // 过滤物品：根据标签和成交状态筛选
  const sellingItems = items.filter(item => item.item_type === 'sell');
  const buyingItems = items.filter(item => item.item_type === 'buy');
  const currentTabItems = activeTab === 'sell' ? sellingItems : buyingItems;
  const displayItems = viewAll ? currentTabItems : currentTabItems.filter(item => !item.isSold);
  const soldItems = currentTabItems.filter(item => item.isSold);

  // 获取目标用户信息
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserInfo = async () => {
      // 如果是当前用户，直接使用已有信息
      const isCurrentUser = currentUser && String(currentUser.id) === String(userId);
      if (isCurrentUser && currentUser) {
        if (isMounted) {
          setUserInfo(currentUser);
        }
        return;
      }
      
      if (!userId) return;
      
      try {
        setUserInfoLoading(true);
        const response = await api.get(`/api/users/user/${userId}`);
        if (isMounted) {
          setUserInfo(response.data.data);
        }
      } catch (err) {
        console.error('获取用户信息失败:', err.response?.data || err.message || err);
      } finally {
        if (isMounted) {
          setUserInfoLoading(false);
        }
      }
    };
    
    fetchUserInfo();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [userId, currentUser]);
  
  // Calculate derived values after hooks
  const isCurrentUser = currentUser && String(currentUser.id) === String(userId);
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }
  
  // 获取显示的用户名
  const getUserName = () => {
    if (userInfoLoading) return '加载用户信息中...';
    if (userInfo) return userInfo.name + '(' + userInfo.employee_id + ')';
    return isCurrentUser ? '我的' : '用户';
  };
 
  return (
    <div className="container">
      {error && <div className="message error">{error}</div>}
      
      <h2>
        {isCurrentUser 
          ? '我的物品' 
          : activeTab === 'sell' 
            ? `${getUserName()}出售的物品` 
            : `${getUserName()}求购的物品`
        }
      </h2>
      
      {/* 标签切换 */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          出售中 ({sellingItems.filter(item => !item.isSold).length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          求购中 ({buyingItems.filter(item => !item.isSold).length})
        </button>
      </div>

      {isCurrentUser && soldItems.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input 
              type="checkbox" 
              checked={viewAll} 
              onChange={() => setViewAll(!viewAll)}
            />
            查看包括已成交的所有{activeTab === 'sell' ? '出售' : '求购'}物品 ({soldItems.length} 件已成交)
          </label>
        </div>
      )}
      
      {displayItems.length > 0 ? (
        <div className="grid">
          {displayItems.map(item => (
            <div className="card item-card" key={item.id}>
              <div className="item-images">
                <img 
                  src={(() => {
                            if (!item.images) return '/assets/images/300x200.svg';
                            
                            let images = item.images;
                            if (typeof images === 'string') {
                              try {
                                images = JSON.parse(images);
                              } catch (parseError) {
                                console.error('解析图片数据失败:', parseError);
                                return '/assets/images/300x200.svg';
                              }
                            }
                            
                            if (!Array.isArray(images)) {
                              images = images ? [images] : [];
                            }
                            
                            if (images.length > 0) {
                              const firstImage = images[0];
                              return getImageUrl(firstImage) || '/assets/images/300x200.svg';
                            }
                            
                            return '/assets/images/300x200.svg';
                          })()} 
                  alt={item.name} 
                  onError={(e) => e.target.src = '/assets/images/300x200.svg'}
                />
                {item.isSold && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'var(--error-color)',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderBottomLeftRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    已成交
                  </div>
                )}
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <div className="item-type-tag" style={{ display: 'inline-block', marginBottom: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: item.item_type === 'sell' ? 'var(--info-color)' : 'var(--success-color)', color: 'white', fontSize: '0.8rem' }}>
                  {item.item_type === 'sell' ? '出售' : '求购'}
                </div>
                {item.item_type === 'sell' && item.item_condition && (
                  <div className="item-condition">
                    {(() => {
                      const conditionMap = {
                        10: '10成新',
                        99: '99成新',
                        95: '95成新',
                        9: '9成新',
                        85: '85成新',
                        8: '8成新',
                        7: '7成新',
                        6: '7成新以下'
                      };
                      return conditionMap[item.item_condition] || `${item.item_condition}成新`;
                    })()}
                  </div>
                )}
                <p>{item.description.substring(0, 50)}...</p>
                <div className="item-price">{item.item_type === 'sell' ? '售价' : '求购价'}: {item.price} 元</div>
                <p>发布于: {new Date(item.createdAt).toLocaleDateString('zh-CN')}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>查看次数: {item.view_count || 0}</p>
                <Link to={`/item/${item.id}`} className="btn btn-primary">查看详情</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="message">
          {isCurrentUser ? `您还没有${activeTab === 'sell' ? '发布任何出售' : '发布任何求购'}物品` : `该用户还没有${activeTab === 'sell' ? '发布任何出售' : '发布任何求购'}物品`}
          {isCurrentUser && (
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              去发布
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default UserItemsPage;