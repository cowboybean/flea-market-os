import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // 获取当前用户信息
  useEffect(() => {
    let isMounted = true;
    
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/api/users/me');
        // 只有当组件仍然挂载时才更新状态
        if (isMounted) {
          setCurrentUser(response.data.data);
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
        // 不需要设置错误状态，因为获取用户信息失败不影响页面主要功能
      }
    };

    fetchCurrentUser();
    
    // 清理函数，在组件卸载或依赖项变化前设置isMounted为false
    return () => {
      isMounted = false;
    };
  }, []);

  // 获取物品详情
  useEffect(() => {
    let isMounted = true;
    
    const fetchItemDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/items/${id}`);
        
        // 只有当组件仍然挂载时才更新状态
        if (isMounted) {
          const itemData = response.data.data;
          // 解析图片数据，如果是JSON字符串则转换为数组
          if (itemData.images && typeof itemData.images === 'string') {
            try {
              itemData.images = JSON.parse(itemData.images);
            } catch (parseError) {
              console.error('解析图片数据失败:', parseError);
              itemData.images = [];
            }
          } else if (!Array.isArray(itemData.images)) {
            // 确保images是数组
            itemData.images = itemData.images ? [itemData.images] : [];
          }
          // 确保images至少是一个空数组
          if (!itemData.images) {
            itemData.images = [];
          }
          setItem(itemData);
        }
      } catch (err) {
        console.error('获取物品详情失败:', err);
        // 只有当组件仍然挂载时才更新状态
        if (isMounted) {
          setError('获取物品详情失败，请稍后重试');
        }
      } finally {
        // 只有当组件仍然挂载时才更新状态
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchItemDetail();
    
    // 清理函数，在组件卸载或依赖项变化前设置isMounted为false
    return () => {
      isMounted = false;
    };
  }, [id]);

  // 删除物品
  const handleDelete = async () => {
    if (window.confirm('确定要删除这个物品吗？此操作不可恢复。')) {
      try {
        await api.delete(`/api/items/${id}`);
        navigate('/');
      } catch (err) {
        console.error('删除物品失败:', err);
        setError('删除物品失败，请稍后重试');
      }
    }
  };

  // 标记成交
  const handleMarkAsSold = async () => {
    if (window.confirm('确定要将此物品标记为已成交吗？')) {
      try {
        await api.put(`/api/items/${id}`, { isSold: true });
        setItem({ ...item, isSold: true });
      } catch (err) {
        console.error('更新物品状态失败:', err);
        setError('更新物品状态失败，请稍后重试');
      }
    }
  };

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

  if (error || !item) {
    return (
      <div className="container">
        <div className="message error">{error || '物品不存在'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === item.user_id;
  console.log(item)
  console.log(currentUser, item.user, item.user_id);
  console.log(isOwner);

  return (
    <div className="container">
      {error && <div className="message error">{error}</div>}
      
      <div className={`message ${item.item_type === 'sell' ? 'info' : 'success'}`}>
        {item.item_type === 'sell' ? '出售' : '求购'}信息
      </div>
      
      {item.isSold && (
        <div className="message warning">
          <strong>此物品已成交</strong>
        </div>
      )}

      <div className="item-detail">
        {/* 物品图片 */}
        <div className="item-detail-images">
          <div className="main-image">
            <img 
              src={item.images && item.images.length > 0 ?
            getImageUrl(item.images[activeImage]) :
            '/assets/images/600x400.svg'} 
              alt={item.name} 
              onError={(e) => e.target.src = '/assets/images/600x400.svg'}
            />
          </div>
          
          {item.images && item.images.length > 1 && (
            <div className="thumbnails">
              {item.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={getImageUrl(img) || '/assets/images/80x80.svg'} 
                    alt={`${item.name} - 图片 ${index + 1}`}
                    onError={(e) => e.target.src = '/assets/images/80x80.svg'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 物品信息 */}
        <div className="card">
          <h2>{item.name}</h2>
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
          <div className="item-price">{item.item_type === 'sell' ? '售价' : '求购价'}: {item.price} 元</div>
          
          <div className="form-group">
            <label>分类</label>
            <div>{item.category}</div>
          </div>
          
          <div className="form-group">
            <label>描述</label>
            <div>{item.description}</div>
          </div>
          
          <div className="form-group">
            <label>发布时间</label>
            <div>{new Date(item.createdAt).toLocaleString('zh-CN')}</div>
          </div>
          <div className="form-group">
            <label>更新时间</label>
            <div>{new Date(item.updatedAt).toLocaleString('zh-CN')}</div>
          </div>
          <div className="form-group">
            <label>查看次数</label>
            <div>{Math.round(item.view_count / 2) || 0}</div>
          </div>
          
          <div className="seller-info">
            <p>
              <strong>{item.item_type === 'sell' ? '卖家' : '求购者'}信息：</strong>
              <Link to={`/user/${item.user_id}`}>{item.user.name}({item.user.employee_id})</Link>
            </p>
          </div>

          {/* 操作按钮 */}
          {isOwner && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/edit/${item.id}`)}>
                编辑物品
              </button>
              {!item.isSold && (
                <button className="btn btn-secondary" onClick={handleMarkAsSold}>
                  标记成交
                </button>
              )}
              <button className="btn btn-danger" onClick={handleDelete}>
                删除物品
              </button>
            </div>
          )}
        </div>
      </div>

      <button className="btn" style={{ marginTop: '1.5rem' }} onClick={() => navigate(-1)}>
        返回上一页
      </button>
    </div>
  );
}

export default ItemDetailPage;