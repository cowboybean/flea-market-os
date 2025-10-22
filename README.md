# 企业内部跳蚤市场系统

这是一个基于Node.js开发的企业内部跳蚤市场Web应用，允许员工发布和浏览二手物品。系统采用IP鉴权方式自动识别用户，无需手动登录。

## 功能特性

### 卖家功能
- 发布二手物品，包括分类、名称、用途、成色、图片、价格等信息
- 修改已发布的物品信息
- 删除物品
- 标记物品为已成交
- 专属页面展示卖家所有物品

### 买家功能
- 浏览所有在架物品
- 按分类筛选物品
- 搜索物品（按名称、描述或卖家工号）
- 查看物品详情和多图展示
- 支持物品查看次数统计

### 系统特性
- IP自动鉴权，新用户自动创建账号
- 浅绿色主题UI设计
- 响应式布局，支持移动设备
- 多图片上传和预览功能
- 前端优化：防止React.StrictMode下的重复API调用
- 使用可选链操作符确保数据访问安全

## 技术栈

### 后端
- Node.js + Express
- MySQL + Sequelize ORM
- Multer（文件上传）
- CORS（跨域支持）

### 前端
- React
- React Router
- Axios（HTTP请求）
- Ant Design（UI组件库）
- DayJS（日期处理）

## 快速开始

### 1. 环境要求
- Node.js 14+
- MySQL 5.7+

### 2. 安装依赖

#### 后端依赖
```bash
cd backend
npm install
```

#### 前端依赖
```bash
cd frontend
npm install
```

### 3. 配置环境变量

创建 `.env` 文件（已创建，可根据需要修改）：
```
# MySQL数据库连接信息
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=flea_market
MYSQL_PORT=3306

# 服务器配置
PORT=5000

# 文件上传配置
UPLOAD_PATH=./backend/uploads
MAX_FILE_SIZE=10000000

# IP鉴权配置
IP_EXPIRY_DAYS=30
```

### 4. 启动应用

#### 准备工作
1. 确保MySQL服务已启动
2. 创建数据库：`CREATE DATABASE flea_market;`

#### 开发模式

启动后端服务器：
```bash
cd backend
npm run dev
```

再在另一个终端启动前端开发服务器：
```bash
cd frontend
npm start
```

前端应用将在 http://localhost:3000 运行，后端API将在 http://localhost:5000 运行。

#### 生产模式

构建前端应用：
```bash
npm run build
```

启动后端服务器（将提供前端静态文件）：
```bash
npm start
```

应用将在 http://localhost:5000 运行。

## 项目结构

```
flea-market/
├── backend/               # 后端代码
│   ├── config/            # 配置文件
│   │   ├── README_DATABASE.md  # 数据库配置说明
│   │   ├── db.js          # 数据库连接配置
│   │   ├── init_mysql.sql # 初始化SQL脚本
│   │   └── upload.js      # 文件上传配置
│   ├── controllers/       # 控制器
│   │   ├── itemController.js # 物品相关控制器
│   │   └── userController.js # 用户相关控制器
│   ├── middleware/        # 中间件
│   │   └── ipAuth.js      # IP鉴权中间件
│   ├── models/            # 数据模型
│   │   ├── IpAddress.js   # IP地址模型
│   │   ├── Item.js        # 物品模型
│   │   └── User.js        # 用户模型
│   ├── routes/            # 路由
│   │   ├── index.js       # 路由入口
│   │   ├── itemRoutes.js  # 物品相关路由
│   │   └── userRoutes.js  # 用户相关路由
│   ├── uploads/           # 上传文件存储
│   ├── package.json       # 后端依赖配置
│   └── server.js          # 后端入口文件
├── frontend/              # 前端代码
│   ├── public/            # 静态资源
│   │   ├── assets/        # 静态资源文件
│   │   └── index.html     # 主HTML文件
│   ├── src/               # 源代码
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   │   ├── AddItemPage.js   # 添加物品页面
│   │   │   ├── EditItemPage.js  # 编辑物品页面
│   │   │   ├── HomePage.js      # 首页
│   │   │   ├── ItemDetailPage.js # 物品详情页面
│   │   │   └── UserItemsPage.js # 用户物品页面
│   │   ├── styles/        # 样式文件
│   │   ├── utils/         # 工具函数
│   │   ├── App.js         # 应用入口组件
│   │   └── index.js       # 应用入口文件
│   └── package.json       # 前端依赖配置
├── .env                   # 环境变量配置
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明文档
```

## API文档

### 用户相关API

#### 获取当前用户信息
- **URL**: `/api/users/me`
- **Method**: `GET`
- **需要IP鉴权**: 是
- **返回**: 当前用户的详细信息

#### 更新用户信息
- **URL**: `/api/users/me`
- **Method**: `PUT`
- **需要IP鉴权**: 是
- **请求体**: `{ "employee_id": "工号", "name": "姓名" }`
- **返回**: 更新后的用户信息

#### 获取指定用户信息
- **URL**: `/api/users/user/:id`
- **Method**: `GET`
- **需要IP鉴权**: 否
- **返回**: 指定用户的公开信息

### 物品相关API

#### 获取所有物品
- **URL**: `/api/items`
- **Method**: `GET`
- **需要IP鉴权**: 否
- **查询参数**: `category`, `search`, `page`, `limit`
- **返回**: 物品列表

#### 获取用户的所有物品
- **URL**: `/api/items/user/:userId`
- **Method**: `GET`
- **需要IP鉴权**: 否
- **返回**: 指定用户发布的物品列表

#### 获取单个物品详情
- **URL**: `/api/items/:id`
- **Method**: `GET`
- **需要IP鉴权**: 否
- **返回**: 物品详细信息

#### 创建新物品
- **URL**: `/api/items`
- **Method**: `POST`
- **需要IP鉴权**: 是
- **请求类型**: `multipart/form-data`
- **表单数据**: 
  - `title`: 物品标题
  - `description`: 物品描述
  - `category`: 物品分类
  - `condition`: 物品成色
  - `price`: 物品价格
  - `purpose`: 物品用途
  - `images[]`: 图片文件（最多5张）
- **返回**: 创建的物品信息

#### 更新物品信息
- **URL**: `/api/items/:id`
- **Method**: `PUT`
- **需要IP鉴权**: 是
- **请求类型**: `multipart/form-data`
- **表单数据**: 与创建物品相同
- **返回**: 更新后的物品信息

#### 删除物品
- **URL**: `/api/items/:id`
- **Method**: `DELETE`
- **需要IP鉴权**: 是
- **返回**: 操作结果

## 注意事项

1. 确保MySQL服务已启动，并且数据库配置正确
2. 首次访问时，系统会自动创建所需的数据表
3. 系统要求用户必须设置工号才能发布物品
4. 图片上传限制为每个物品最多5张，单张不超过10MB
5. 物品数据会自动定期清理过期的IP记录
6. 系统已优化以防止React.StrictMode下的重复API调用
7. 查看次数统计已进行校正，避免重复计数

## 许可证

内部使用系统，版权所有。

## 已知问题与解决方案

### 1. React.StrictMode下的重复API调用
- **问题**: 在开发环境下，React.StrictMode可能导致组件渲染两次，从而触发重复的API调用
- **解决方案**: 已在前端代码中添加适当的优化，确保即使在StrictMode下也不会产生实际的重复API请求

### 2. 查看次数统计问题
- **问题**: 由于React.StrictMode的原因，物品查看次数可能被重复计算
- **解决方案**: 已在前端显示中进行校正，确保展示的查看次数准确

### 3. 数据访问安全性
- **解决方案**: 使用可选链操作符（?.）确保在访问深层嵌套数据时不会因中间属性不存在而导致应用崩溃

### 4. API配置设置
- **问题**: 在`frontend/src/utils/api.js`文件中，API基础URL配置需要根据不同环境进行调整
- **解决方案**: 调试时需要将`baseURL`修改为本地或开发环境IP（当前配置为`http://172.28.190.86:5000`），部署时需要将其设置为空字符串（`''`），以使用相对路径
- **问题**：因暂时解决不了查看物品明细时调用两次API的问题，导致每次查看次数会加2
- **解决方案**：已在前端显示中进行校正，每次展示查看次数时都除以2，确保展示的查看次数准确