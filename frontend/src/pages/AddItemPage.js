import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

function AddItemPage({ currentUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '电子产品',
    name: '',
    description: '',
    item_condition: 95,
    price: '',
    item_type: 'sell'
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理图片选择
  const handleImageChange = (e) => {
    // 检查是否有文件被选中
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFiles = Array.from(e.target.files);
    
    // 计算总数：当前图片 + 新选择的图片
    const totalImages = images.length + selectedFiles.length;
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

    setImages(prev => [...prev, ...selectedFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  // 移除图片
  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];
    
    // 移除新选择的图片
    const newImages = [...images];
    // 找到对应的文件索引
    const fileIndex = newImages.findIndex(file => {
      return URL.createObjectURL(file) === previewToRemove.url;
    });
    if (fileIndex !== -1) {
      newImages.splice(fileIndex, 1);
    }
    setImages(newImages);
    
    // 释放预览URL
    URL.revokeObjectURL(previewToRemove.url);
    
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
    
    // 对于出售类型的物品，价格是必填的
    if (formData.item_type === 'sell') {
      if (!formData.price || parseFloat(formData.price) < 0) {
        setError('请输入有效的价格');
        return;
      }
      
      // 出售商品时，成色是必填的
      if (!formData.item_condition) {
        setError('请选择物品成色');
        return;
      }
    }
    
    // 对于求购类型的物品，价格可以为空或设为有效数字
    if (formData.item_type === 'buy' && formData.price && parseFloat(formData.price) < 0) {
      setError('请输入有效的价格或留空');
      return;
    }
    
    // 图片上传不再是必填项
    // 可以选择不上传图片，使用默认图片
    try {
      setLoading(true);
      setError('');
      
      // 创建FormData对象
      const data = new FormData();
      
      // 添加表单字段
      Object.keys(formData).forEach(key => {
        // 对于求购类型，如果价格为空，不添加到FormData
        if (key === 'price' && formData.item_type === 'buy' && !formData.price) {
          return;
        }
        data.append(key, formData[key]);
      });
      
      // 添加图片文件（只添加新选择的图片）
      images.forEach(image => {
        data.append('images', image);
      });
      
      // 发送请求
      const response = await api.post('/api/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('物品发布成功');
      
      // 清理预览URL
      imagePreviews.forEach(preview => {
        if (!preview.isOriginal && preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      // 重置表单
      setFormData({
        category: '电子产品',
        name: '',
        description: '',
        item_condition: 8,
        price: '',
        item_type: 'sell'
      });
      
      setImages([]);
      setImagePreviews([]);
      
      // 跳转到物品详情页
      setTimeout(() => {
        navigate(`/item/${response.data.data.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('发布物品失败:', err);
      setError('发布物品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>发布新物品</h2>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="item_type">物品类型 <span className="required">*</span></label>
          <select 
            id="item_type" 
            name="item_type" 
            value={formData.item_type} 
            onChange={handleChange}
            required
          >
            <option value="sell">出售商品</option>
            <option value="buy">求购商品</option>
          </select>
        </div>
        
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
          <label htmlFor="price">{formData.item_type === 'sell' ? '售价' : '求购价'} (元) {formData.item_type === 'sell' && <span className="required">*</span>}</label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            value={formData.price} 
            onChange={handleChange}
            placeholder={`请输入${formData.item_type === 'sell' ? '出售' : '求购'}价格（求购可留空）`}
            step="0.01"
            min="0"
            required={formData.item_type === 'sell'}
          />
        </div>
        
        <div className="form-group">
          <label>物品图片 (可选，最多5张)</label>
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
            <p>点击或拖拽文件到此处上传（可选）</p>
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
          {images.length < 5 && (
            <p className="image-count">
              {images.length}/5 图片已上传
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '提交中...' : formData.item_type === 'sell' ? '发布商品' : '发布求购'}
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItemPage;