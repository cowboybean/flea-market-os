import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

function EditItemPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '电子产品',
    name: '',
    description: '',
    item_condition: 95,
    price: '',
    item_type: 'sell',
    isSold: false
  });
  const [originalImages, setOriginalImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    '电子产品',
    '办公用品',
    '生活用品',
    '服装鞋帽',
    '图书音像',
    '其他'
  ];

  // 获取物品详情
  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        setFetching(true);
        const response = await api.get(`/api/items/${id}`);
        const item = response.data.data;
        
        // 检查权限
        if (currentUser && currentUser.id !== item.user_id) {
          setError('您无权修改此物品');
          return;
        }
        
        // 设置表单数据
        setFormData({
          category: item.category,
          name: item.name,
          description: item.description,
          item_condition: item.item_condition || 8,
          price: item.price,
          item_type: item.item_type || 'sell',
          isSold: item.isSold
        });
        
        // 设置原始图片
        if (item.images){
          // 解析图片数据，如果是JSON字符串则转换为数组
          let parsedImages = item.images;
          if (typeof item.images === 'string') {
            try {
              parsedImages = JSON.parse(item.images);
            } catch (parseError) {
              console.error('解析图片数据失败:', parseError);
              parsedImages = [];
            }
          } else if (!Array.isArray(parsedImages)) {
            parsedImages = parsedImages ? [parsedImages] : [];
          }
          
          setOriginalImages(parsedImages);
          
          // 创建原始图片预览
          const previews = parsedImages.map(img => ({
            url: getImageUrl(img),
            isOriginal: true,
            filename: img.filename || img // 如果没有filename属性，使用整个对象作为标识
          }));
          setImagePreviews(previews);
        }
      } catch (err) {
        console.error('获取物品详情失败:', err);
        setError('获取物品详情失败，请稍后重试');
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetail();
  }, [id, currentUser]);

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 处理图片选择
  const handleImageChange = (e) => {
    // 检查是否有文件被选中
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFiles = Array.from(e.target.files);
    
    // 计算总数：原图片 + 新图片
    const totalImages = originalImages.length + newImages.length + selectedFiles.length;
    if (totalImages > 5) {
      setError('最多只能上传5张图片');
      return;
    }

    // 创建预览
    const newPreviews = selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isOriginal: false
    }));

    setNewImages(prev => [...prev, ...selectedFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  // 移除图片
  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];
    
    if (previewToRemove.isOriginal) {
      // 移除原始图片
      const newOriginalImages = [...originalImages];
      newOriginalImages.splice(index, 1);
      setOriginalImages(newOriginalImages);
    } else {
      // 移除新选择的图片
      const newNewImages = [...newImages];
      // 找到对应的文件索引
      const fileIndex = newNewImages.findIndex(file => {
        return URL.createObjectURL(file) === previewToRemove.url;
      });
      if (fileIndex !== -1) {
        newNewImages.splice(fileIndex, 1);
      }
      setNewImages(newNewImages);
      // 释放预览URL
      URL.revokeObjectURL(previewToRemove.url);
    }
    
    // 更新预览列表
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name.trim()) {
      setError('请输入物品名称');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('请输入物品描述');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('请输入有效的价格');
      return;
    }
    
    // 仅对出售商品验证成色
    if (formData.item_type === 'sell' && !formData.item_condition) {
      setError('请选择物品成色');
      return;
    }
    
    // 图片上传不再是必填项
    if (originalImages.length + newImages.length === 0) {
      // 可以选择不上传图片，使用默认图片
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 创建FormData对象
      const data = new FormData();
      
      // 添加表单字段
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // 添加原始图片（仅文件名，用于后端判断需要保留的图片）
      originalImages.forEach(img => {
        data.append('originalImages', img.filename || img);
      });
      
      // 添加新图片文件
      newImages.forEach(image => {
        data.append('images', image);
      });
      
      // 发送请求
      await api.put(`/api/items/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('物品更新成功');
      
      // 跳转到物品详情页
      setTimeout(() => {
        navigate(`/item/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('更新物品失败:', err);
      setError('更新物品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>编辑物品</h2>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">物品分类 <span className="required">*</span></label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">物品名称 <span className="required">*</span></label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="请输入物品名称"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">物品描述 <span className="required">*</span></label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="请详细描述物品的用途、特点等信息"
            rows="5"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="item_type">物品类型 <span className="required">*</span></label>
          <select 
            id="item_type" 
            name="item_type" 
            value={formData.item_type} 
            onChange={handleChange}
            required
          >
            <option value="sell">我要卖</option>
            <option value="buy">我想买</option>
          </select>
        </div>
        
        {formData.item_type === 'sell' && (
          <div className="form-group">
            <label htmlFor="item_condition">物品成色 <span className="required">*</span></label>
            <select 
              id="item_condition" 
              name="item_condition" 
              value={formData.item_condition} 
              onChange={handleChange}
              required
            >
              {[
                {value: 10, label: '10成新'},
                {value: 99, label: '99成新'},
                {value: 95, label: '95成新'},
                {value: 9, label: '9成新'},
                {value: 85, label: '85成新'},
                {value: 8, label: '8成新'},
                {value: 7, label: '7成新'},
                {value: 6, label: '7成新以下'}
              ].map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="price">{formData.item_type === 'sell' ? '出售' : '求购'}价格 (元) <span className="required">*</span></label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            value={formData.price} 
            onChange={handleChange}
            placeholder={`请输入${formData.item_type === 'sell' ? '出售' : '求购'}价格`}
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="isSold">
            <input 
              type="checkbox" 
              id="isSold" 
              name="isSold" 
              checked={formData.isSold} 
              onChange={handleChange}
            />
            已成交
          </label>
        </div>
        
        <div className="form-group">
          <label>物品图片 <span className="required">*</span> (最多5张，可删除或添加)</label>
          <div 
            className="file-upload" 
            onClick={() => document.getElementById('images').click()}
          >
            <input 
              type="file" 
              id="images" 
              accept="image/*" 
              multiple 
              onChange={handleImageChange}
            />
            <p>点击或拖拽文件到此处上传新图片</p>
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="upload-preview">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img src={preview.url} alt={`预览 ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image" 
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '保存中...' : '保存修改'}
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => navigate(`/item/${id}`)}
            disabled={loading}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditItemPage;