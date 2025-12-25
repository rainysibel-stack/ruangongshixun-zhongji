# 智能食谱管理系统 - API接口文档

## 基础信息

- **Base URL**: `http://127.0.0.1:3000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON
- **字符编码**: UTF-8

---

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 400/401/403/404/500,
  "message": "错误描述",
  "data": null
}
```

### HTTP状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 认证说明

### 请求头格式
```
Authorization: Bearer <token>
```

### 游客访问
某些接口支持游客访问，使用特殊token：
```
Authorization: Bearer guest-token
```

### Token获取
通过登录或注册接口获取JWT token，有效期根据服务器配置。

---

## 1. 用户模块 (User)

### 1.1 用户注册

**接口**: `POST /api/users/register`

**认证**: 不需要

**请求参数**:
```json
{
  "username": "张三",
  "phone": "13800138000",
  "password": "123456",
  "confirmPassword": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（作为昵称使用） |
| phone | string | 是 | 手机号（11位数字，唯一） |
| password | string | 是 | 密码 |
| confirmPassword | string | 是 | 确认密码（需与password一致） |

**成功响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:
- `400`: 参数缺失、密码不一致、手机号已注册

---

### 1.2 用户登录

**接口**: `POST /api/users/login`

**认证**: 不需要

**请求参数**:
```json
{
  "identifier": "13800138000",
  "password": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| identifier | string | 是 | 用户ID或手机号 |
| password | string | 是 | 密码 |

**成功响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "张三",
      "phone": "13800138000",
      "nickname": "张三",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应**:
- `401`: 用户名/手机号或密码错误

---

### 1.3 获取个人资料

**接口**: `GET /api/users/profile`

**认证**: 需要

**请求参数**: 无

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138000",
    "nickname": "张三",
    "created_at": "2025-01-01T00:00:00.000Z",
    "stats": {
      "recipeCount": 5,
      "favoriteCount": 12,
      "cookedCount": 28
    }
  }
}
```

---

### 1.4 更新个人资料

**接口**: `PUT /api/users/profile`

**认证**: 需要

**请求参数**:
```json
{
  "nickname": "新昵称"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 新昵称 |

**成功响应**:
```json
{
  "code": 200,
  "message": "Profile updated",
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138000",
    "nickname": "新昵称"
  }
}
```

---

## 2. 食谱模块 (Recipe)

### 2.1 获取食谱列表

**接口**: `GET /api/recipes`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| category | string | 否 | - | 分类筛选（早餐/午餐/晚餐/汤/甜点等） |
| sort | string | 否 | latest | 排序方式（latest/recent/favorite） |
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 10 | 每页数量 |
| mine | string | 否 | - | 是否仅显示个人食谱（"true"） |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": 1,
        "name": "番茄炒蛋",
        "category": "家常菜",
        "difficulty": "简单",
        "cooking_time": "15分钟",
        "image": "https://...",
        "cooked_count": 5,
        "is_favorite": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "ingredients": [{"name": "番茄", "quantity": "2个"}]
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

---

### 2.2 获取系统食谱

**接口**: `GET /api/recipes/square`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词（搜索名称和食材） |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": 63,
        "name": "宫保鸡丁",
        "category": "川菜",
        "difficulty": "中等",
        "cooking_time": "25分钟",
        "image": "https://...",
        "cooked_count": 0,
        "ingredients": [...],
        "user_id": null
      }
    ]
  }
}
```

**说明**: 
- 仅返回系统食谱（user_id为null）
- 随机排序
- 最多返回20条

---

### 2.3 获取食谱详情

**接口**: `GET /api/recipes/:id`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 食谱ID |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "番茄炒蛋",
    "category": "家常菜",
    "difficulty": "简单",
    "cooking_time": "15分钟",
    "image": "https://...",
    "ingredients": [
      {"name": "番茄", "quantity": "2个"},
      {"name": "鸡蛋", "quantity": "3个"}
    ],
    "steps": [
      "番茄切块",
      "鸡蛋打散",
      "热油炒蛋",
      "加入番茄翻炒"
    ],
    "tips": "番茄要选熟透的",
    "nutrition": {
      "calories": "200kcal",
      "protein": "12g"
    },
    "is_favorite": true,
    "cooked_count": 5,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 2.4 创建食谱

**接口**: `POST /api/recipes`

**认证**: 需要

**请求参数**:
```json
{
  "name": "我的新食谱",
  "category": "家常菜",
  "difficulty": "简单",
  "cooking_time": "20分钟",
  "image": "https://...",
  "ingredients": [
    {"name": "食材1", "quantity": "100g"}
  ],
  "steps": ["步骤1", "步骤2"],
  "tips": "烹饪提示",
  "nutrition": {
    "calories": "300kcal"
  }
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "Recipe created successfully",
  "data": { ... }
}
```

---

### 2.5 收藏/取消收藏（个人食谱）

**接口**: `POST /api/recipes/:id/favorite`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 食谱ID |

**说明**: 此接口仅用于个人创建的食谱（user_id不为null）

**成功响应**:
```json
{
  "code": 200,
  "message": "Added to favorites",
  "data": {
    "is_favorite": true
  }
}
```

---

### 2.6 记录烹饪

**接口**: `POST /api/recipes/:id/cook`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 食谱ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "Cooking recorded",
  "data": {
    "cooked_count": 6
  }
}
```

---

### 2.7 Fork食谱（复制到个人）

**接口**: `POST /api/recipes/:id/fork`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 系统食谱ID |

**说明**: 将系统食谱复制为个人食谱，自动设置为收藏

**成功响应**:
```json
{
  "code": 200,
  "message": "已添加到我的食谱并收藏",
  "data": { ... }
}
```

---

## 3. 用户-食谱关联模块 (UserRecipe)

### 3.1 添加系统食谱到个人库

**接口**: `POST /api/user-recipes/add`

**认证**: 需要

**请求参数**:
```json
{
  "recipe_id": 63
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recipe_id | number | 是 | 系统食谱ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "Recipe added successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "recipe_id": 63,
    "is_favorite": false,
    "added_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 3.2 移除系统食谱

**接口**: `DELETE /api/user-recipes/remove/:recipe_id`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| recipe_id | number | 系统食谱ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "Recipe removed successfully",
  "data": null
}
```

---

### 3.3 收藏/取消收藏（系统食谱）

**接口**: `POST /api/user-recipes/favorite`

**认证**: 需要

**请求参数**:
```json
{
  "recipe_id": 63
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recipe_id | number | 是 | 系统食谱ID |

**说明**: 
- 如果用户未添加该食谱，会自动添加并收藏
- 如果已添加，则切换收藏状态

**成功响应**:
```json
{
  "code": 200,
  "message": "Favorite toggled",
  "data": {
    "is_favorite": true
  }
}
```

---

### 3.4 获取已添加的系统食谱

**接口**: `GET /api/user-recipes/my-added`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类筛选 |
| sort | string | 否 | 排序（latest/favorite） |
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认10） |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": 63,
        "name": "宫保鸡丁",
        "is_favorite": true,
        "is_added": true,
        ...
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### 3.5 获取系统食谱列表

**接口**: `GET /api/user-recipes/system`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类筛选 |
| difficulty | string | 否 | 难度筛选 |
| time | string | 否 | 时间筛选 |
| keyword | string | 否 | 搜索关键词 |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [...],
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

**说明**: 返回的食谱包含`is_added`和`is_favorite`字段，表示当前用户是否已添加/收藏

---

### 3.6 获取随机系统食谱

**接口**: `GET /api/user-recipes/system/random`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | number | 否 | 12 | 返回数量 |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": 63,
        "name": "宫保鸡丁",
        "is_favorite": true,
        "is_added": true,
        ...
      }
    ]
  }
}
```

**说明**: 用于食谱广场的随机推荐

---

## 4. 冰箱模块 (Fridge)

### 4.1 获取冰箱信息

**接口**: `GET /api/fridge`

**认证**: 需要

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "user_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 4.2 获取冰箱食材列表

**接口**: `GET /api/fridge/:fridgeId/items`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| fridgeId | number | 冰箱ID |

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| view | string | 否 | 视图模式（list/category） |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "ingredient_name": "番茄",
        "quantity": "3",
        "category": "蔬菜水果",
        "unit": "个",
        "added_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.3 添加冰箱食材

**接口**: `POST /api/fridge/:fridgeId/items`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| fridgeId | number | 冰箱ID |

**请求参数**:
```json
{
  "ingredient_name": "番茄",
  "quantity": "3",
  "category": "蔬菜水果",
  "unit": "个"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ingredient_name | string | 是 | 食材名称 |
| quantity | string | 否 | 数量 |
| category | string | 否 | 分类 |
| unit | string | 否 | 单位 |

**成功响应**:
```json
{
  "code": 200,
  "message": "已添加番茄(3个)到冰箱",
  "data": {
    "itemId": 1
  }
}
```

---

### 4.4 删除冰箱食材

**接口**: `DELETE /api/fridge/items/:itemId`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| itemId | number | 食材ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "Item removed from fridge",
  "data": {
    "success": true
  }
}
```

---

## 5. 采购清单模块 (ShoppingItem)

### 5.1 获取采购清单

**接口**: `GET /api/shopping-items`

**认证**: 需要

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "鸡蛋",
        "quantity": "1盒",
        "category": "肉禽蛋奶"
      }
    ]
  }
}
```

---

### 5.2 添加采购项

**接口**: `POST /api/shopping-items`

**认证**: 需要

**请求参数**:
```json
{
  "name": "鸡蛋",
  "quantity": "1盒"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 食材名称 |
| quantity | string | 否 | 数量 |

**成功响应**:
```json
{
  "code": 200,
  "message": "已添加到采购清单",
  "data": {
    "itemId": 1
  }
}
```

---

### 5.3 移至冰箱

**接口**: `POST /api/shopping-items/:id/to-fridge`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 采购项ID |

**说明**: 
- 将采购项添加到冰箱
- 自动分类食材
- 从采购清单删除

**成功响应**:
```json
{
  "code": 200,
  "message": "已将鸡蛋添加到冰箱",
  "data": {
    "success": true
  }
}
```

---

### 5.4 删除采购项

**接口**: `DELETE /api/shopping-items/:id`

**认证**: 需要

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 采购项ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "Item deleted",
  "data": {
    "success": true
  }
}
```

---

## 6. 推荐模块 (Recommendation)

### 6.1 获取食谱推荐

**接口**: `GET /api/recommendations`

**认证**: 需要

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| mode | string | 否 | flexible | 推荐模式（all/can_make/partial） |
| category | string | 否 | - | 分类筛选 |
| sort | string | 否 | match | 排序方式（match/time/difficulty） |
| scope | string | 否 | all | 范围（all/system/mine） |

**推荐模式说明**:
- `all`: 所有食谱
- `can_make`: 仅可完全制作的食谱（所有食材都有）
- `partial`: 部分食材匹配的食谱

**范围说明**:
- `all`: 系统食谱 + 个人食谱
- `system`: 仅系统食谱
- `mine`: 仅个人食谱

**排序说明**:
- `match`: 按匹配度排序（默认）
- `time`: 按烹饪时间排序
- `difficulty`: 按难度排序

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": 1,
        "name": "番茄炒蛋",
        "category": "家常菜",
        "difficulty": "简单",
        "cooking_time": "15分钟",
        "image": "https://...",
        "cooked_count": 5,
        "is_favorite": true,
        "user_id": null,
        "matchCount": 2,
        "totalIngredients": 3,
        "matchPercentage": 67,
        "missingIngredients": ["盐"]
      }
    ]
  }
}
```

**响应字段说明**:
- `matchCount`: 匹配的食材数量
- `totalIngredients`: 食谱所需食材总数
- `matchPercentage`: 匹配百分比
- `missingIngredients`: 缺少的食材列表

---

## 附录

### A. 数据字典

#### 分类 (category)
- 早餐
- 午餐
- 晚餐
- 家常菜
- 川菜
- 粤菜
- 汤
- 甜点
- 其他

#### 难度 (difficulty)
- 简单
- 中等
- 困难

#### 食材分类
- 蔬菜水果
- 肉禽蛋奶
- 调味料
- 主食
- 其他

### B. 错误码对照表

| 错误码 | 说明 | 常见原因 |
|--------|------|----------|
| 400 | 请求参数错误 | 缺少必填参数、参数格式错误 |
| 401 | 未授权 | Token无效、Token过期、未提供Token |
| 403 | 禁止访问 | 无权访问该资源 |
| 404 | 资源不存在 | ID不存在、用户不存在 |
| 500 | 服务器错误 | 数据库错误、代码异常 |

### C. 测试账号

**演示用户**:
- 手机号: `13800138000`
- 密码: `123456`
- 用户ID: `1`

**游客Token**: `guest-token`

### D. 开发环境配置

**启动后端服务**:
```bash
cd server
node app.js
```

**启动前端服务**:
```bash
cd client
npm run dev
```

**数据库初始化**:
```bash
cd server
node seed_new.js
```

### E. 注意事项

1. **收藏功能区分**:
   - 系统食谱（user_id=null）: 使用 `/api/user-recipes/favorite`
   - 个人食谱（user_id!=null）: 使用 `/api/recipes/:id/favorite`

2. **分页查询**:
   - 默认每页10条
   - 页码从1开始
   - 返回总页数和总记录数

3. **JSON字段**:
   - `ingredients`: 数组格式 `[{"name":"食材","quantity":"数量"}]`
   - `steps`: 字符串数组 `["步骤1","步骤2"]`
   - `nutrition`: 对象格式 `{"calories":"200kcal","protein":"10g"}`

4. **时区**:
   - 所有时间字段使用 UTC+8 (Asia/Shanghai)
   - 格式: ISO 8601 (`2025-01-01T00:00:00.000Z`)

5. **游客限制**:
   - 游客可以浏览食谱和推荐
   - 游客不能创建、修改、收藏食谱
   - 游客不能使用冰箱和采购清单功能
