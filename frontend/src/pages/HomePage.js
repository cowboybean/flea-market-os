import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

function HomePage({ currentUser }) {
  // 物品数据状态
  const [sellingItems, setSellingItems] = useState([]);
  const [buyingItems, setBuyingItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  
  // 分页和加载状态
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  // UI和过滤状态
  const [activeTab, setActiveTab] = useState('selling');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  
  const categories = [
    '全部',
    '电子产品',
    '办公用品',
    '生活用品',
    '服装鞋帽',
    '图书音像',
    '其他'
  ];

  // 加载更多物品
  const loadMoreItems = useCallback(async () => {

    console.log(currentUser)
    
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      // 根据当前激活的标签加载对应的下一页数据
      const nextPage = page + 1;
      
      if (activeTab === 'selling') {
        // 使用axios get方法获取物品列表
        const response = await api.get('/api/items', {
          params: {
            page: nextPage,
            limit: 10,
            item_type: 'sell',
            category: selectedCategory === '全部' ? '' : selectedCategory
          }
        });
        const newItems = response.data?.data || [];
        if (newItems.length > 0) {
          setSellingItems(prev => [...prev, ...newItems]);
          setPage(nextPage);
          // 如果返回的数量小于限制，说明没有更多数据了
          setHasMore(newItems.length === 10);
        } else {
          setHasMore(false);
        }
      } else if (activeTab === 'buying') {
        // 使用axios get方法获取求购列表
        const response = await api.get('/api/items', {
          params: {
            page: nextPage,
            limit: 10,
            item_type: 'buy',
            category: selectedCategory === '全部' ? '' : selectedCategory
          }
        });
        const newItems = response.data?.data || [];
        if (newItems.length > 0) {
          setBuyingItems(prev => [...prev, ...newItems]);
          setPage(nextPage);
          setHasMore(newItems.length === 10);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('加载更多物品失败:', err);
      // 可以添加一个短暂的错误消息，但不设置全局error状态
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, activeTab, selectedCategory, currentUser, setSellingItems, setBuyingItems, setPage, setHasMore]);
  
  // 滚动监听引用 - 在loadMoreItems定义之后定义
  const observerRef = useRef(null);
  const lastItemRef = useCallback(node => {
    // 清理之前的observer
    if (observerRef.current) observerRef.current.disconnect();
    
    // 创建新的observer来检测最后一个元素是否进入视口
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        // 当最后一个元素进入视口且还有更多数据且不正在加载时，加载更多
        loadMoreItems();
      }
    }, {
      rootMargin: '100px', // 添加预加载区域，提前触发加载
      threshold: 0.1 // 当10%的元素进入视口时触发
    });
    
    // 观察最后一个元素
    if (node) observerRef.current.observe(node);
  }, [hasMore, loadingMore, loadMoreItems]);
  

  
  // 获取物品数据
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1); // 重置页码
        setHasMore(true); // 重置是否有更多数据
        
        let sellingRes, buyingRes, myItemsRes;
        
        // 获取第一页的出售物品和求购物品
        const promises = [];
        if (activeTab === 'selling' || activeTab === 'buying') {
          if (activeTab === 'selling' || activeTab === 'all') {
            promises.push(api.get(`/api/items?item_type=sell&page=1&limit=10&category=${selectedCategory === '全部' ? '' : selectedCategory}`));
          }
          if (activeTab === 'buying' || activeTab === 'all') {
            promises.push(api.get(`/api/items?item_type=buy&page=1&limit=10&category=${selectedCategory === '全部' ? '' : selectedCategory}`));
          }
          
          const results = await Promise.all(promises);
          let resultIndex = 0;
          if (activeTab === 'selling' || activeTab === 'all') {
            sellingRes = results[resultIndex++];
            setSellingItems(sellingRes?.data?.data || []);
            // 如果返回的数据少于限制数量，说明没有更多数据
            if (sellingRes && (!sellingRes.data.data || sellingRes.data.data.length < 10)) {
              setHasMore(false);
            }
          }
          if (activeTab === 'buying' || activeTab === 'all') {
            buyingRes = results[resultIndex];
            setBuyingItems(buyingRes?.data?.data || []);
            if (buyingRes && (!buyingRes.data.data || buyingRes.data.data.length < 10)) {
              setHasMore(false);
            }
          }
        }
        
        // 如果用户已登录且查看的是我的物品或全部
        if (currentUser &&  activeTab === 'all') {
          myItemsRes = await api.get(`/api/users/${currentUser.id}/items?page=1&limit=10&category=${selectedCategory === '全部' ? '' : selectedCategory}`);
          setMyItems(myItemsRes?.data?.data || []);
          if (myItemsRes && (!myItemsRes.data.data || myItemsRes.data.data.length < 10)) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('获取物品列表失败:', err);
        setError('获取物品列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, selectedCategory, currentUser]);
  
  // 切换标签时重新加载数据
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedCategory('全部');
    // 切换标签时重置分页相关状态
    setPage(1);
    setHasMore(true);
  };

  // 过滤物品
  const getFilteredItems = (items) => {
    // 当有搜索词时，进行客户端过滤
    if (searchTerm.trim()) {
      return items.filter(item => {
        const matchesSearch = 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sellerId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });
    }
    // 当只有分类过滤时，已经在API层面进行了过滤
    return items;
  };
  
  // 根据当前标签获取过滤后的物品
  const currentFilteredItems = getFilteredItems(
    activeTab === 'selling' ? sellingItems : 
    activeTab === 'buying' ? buyingItems : myItems
  );

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

  if (error) {
    return (
      <div className="container">
        <div className="message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      
      {/* 标签切换 */}
      <div className="tabs">
        <button 
          className={activeTab === 'selling' ? 'active' : ''}
          onClick={() => handleTabChange('selling')}
        >
          在出售的宝贝
        </button>
        <button 
          className={activeTab === 'buying' ? 'active' : ''}
          onClick={() => handleTabChange('buying')}
        >
          在求购的宝贝
        </button>
      </div>
      
      {/* 搜索和过滤 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={`搜索${activeTab === 'selling' ? '商品' : activeTab === 'buying' ? '求购' : '我的物品'}名称、描述、分类或用户工号...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* 物品列表 */}
      {currentFilteredItems.length > 0 ? (
        <>
          <div className="grid">
            {currentFilteredItems.map((item, index) => {
              const userInfo = item.user || { employee_id: item.sellerId || '未知' };
              const isSelling = item.item_type === 'sell' || (!item.item_type && item.seller_id);
              
              // 检查是否是最后一个元素，如果是则添加ref
              const isLastItem = index === currentFilteredItems.length - 1;
              
              return (
                <div 
                  className="card item-card" 
                  key={item.id}
                  ref={isLastItem ? lastItemRef : undefined}
                >
                  <div className="item-images">
                    <img 
                      src={(() => {
                        if (!item.images) return '/assets/images/300x200.svg';
                          
                        // 处理images数据
                        let images = item.images;
                        if (typeof images === 'string') {
                          try {
                            images = JSON.parse(images);
                          } catch (parseError) {
                            console.error('解析图片数据失败:', parseError);
                            return '/assets/images/300x200.svg';
                          }
                        }
                          
                        // 确保images是数组
                        if (!Array.isArray(images)) {
                          images = images ? [images] : [];
                        }
                          
                        // 获取第一张图片的URL
                        if (images.length > 0) {
                          const firstImage = images[0];
                          const imageUrl = firstImage?.url ? firstImage.url : firstImage;
                          const fullUrl = getImageUrl(imageUrl);
                          return fullUrl || '/assets/images/300x200.svg';
                        }
                          
                        return '/assets/images/300x200.svg';
                      })()} 
                      alt={item.name} 
                      onError={(e) => e.target.src = '/assets/images/300x200.svg'}
                    />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    {isSelling && item.item_condition && (
                      <div className="item-condition">{item.item_condition}成新</div>
                    )}
                    <p>{item.description.substring(0, 50)}...</p>
                    <div className="item-price">
                      {isSelling ? '售价: ' : '求购价: '}{item.price} 元
                    </div>
                    <p className="seller-info" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      {isSelling ? '卖家: ' : '求购者: '} 
                      <Link to={`/user/${userInfo.id || item.user_id || item.seller_id}`}>
                        {userInfo.name}({userInfo.employee_id})
                      </Link>
                    </p>
                    <p className="update-time" style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.3rem', fontStyle: 'italic' }}>
                      发布时间: {new Date(item.createdAt).toLocaleString('zh-CN')}
                      <br />
                      最后更新: {new Date(item.updatedAt).toLocaleString('zh-CN')}
                    </p>
                    <p className="view-count" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      查看次数: {Math.round(item.view_count / 2) || 0}
                    </p>
                    <Link to={`/item/${item.id}`} className="btn btn-primary">查看详情</Link>
                  </div>
                </div>
              );
            })}
            
            {/* 加载更多指示器 */}
            {loadingMore && (
              <div className="loading-more">
                <div className="loading-spinner small"></div>
                <p>加载更多...</p>
              </div>
            )}
          </div>
          
          {/* 没有更多数据的提示 - 移到网格外部，底部居中显示 */}
          {!hasMore && currentFilteredItems.length > 0 && (
            <div className="no-more-data-center">
              没有更多数据了
            </div>
          )}
        </>
      ) : (
        <div className="message">
          {loading ? '加载中...' : (!currentUser ? '请先登录' : '没有找到符合条件的物品')}
        </div>
      )}
    </div>
  );
}

export default HomePage;