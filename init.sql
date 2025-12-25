-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一标识',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名，用于登录',
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号，用于登录和找回密码',
    password VARCHAR(100) NOT NULL COMMENT '加密后的密码',
    nickname VARCHAR(50) COMMENT '昵称，显示在个人页面',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
) COMMENT='用户信息表';

-- 冰箱表
CREATE TABLE IF NOT EXISTS fridges (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '冰箱唯一标识',
    user_id INT UNIQUE NOT NULL COMMENT '关联用户ID，一个用户一个冰箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) COMMENT='用户冰箱表';

-- 冰箱食材表
CREATE TABLE IF NOT EXISTS fridge_items (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '食材记录唯一标识',
    fridge_id INT NOT NULL COMMENT '关联冰箱ID',
    ingredient_name VARCHAR(50) NOT NULL COMMENT '食材名称',
    quantity VARCHAR(20) COMMENT '数量',
    category VARCHAR(20) COMMENT '分类：蔬菜水果/肉禽蛋奶/调味料/其他',
    unit VARCHAR(20) COMMENT '单位，如"个"、"g"、"ml"',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    FOREIGN KEY (fridge_id) REFERENCES fridges(id) ON DELETE CASCADE,
    INDEX idx_fridge_id (fridge_id),
    INDEX idx_category (category)
) COMMENT='冰箱食材库存表';

-- 食谱表
CREATE TABLE IF NOT EXISTS recipes (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '食谱唯一标识',
    user_id INT NOT NULL COMMENT '关联用户ID，食谱创建者',
    name VARCHAR(100) NOT NULL COMMENT '食谱名称',
    category VARCHAR(20) COMMENT '分类：正餐/甜点/早餐/汤羹',
    difficulty VARCHAR(20) COMMENT '难度等级：简单/中等/困难',
    cooking_time VARCHAR(20) COMMENT '烹饪时间',
    image VARCHAR(200) COMMENT '图片URL或emoji表示',
    ingredients JSON COMMENT '所需食材列表，JSON数组格式',
    steps JSON COMMENT '烹饪步骤，JSON数组格式',
    tips TEXT COMMENT '烹饪小贴士',
    nutrition JSON COMMENT '营养信息，JSON数组格式',
    is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    cooked_count INT DEFAULT 0 COMMENT '烹饪次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_favorite (is_favorite),
    INDEX idx_created_at (created_at)
) COMMENT='食谱信息表';

-- 采购清单表
CREATE TABLE IF NOT EXISTS shopping_items (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '采购项唯一标识',
    user_id INT NOT NULL COMMENT '关联用户ID',
    name VARCHAR(50) NOT NULL COMMENT '食材名称',
    quantity VARCHAR(20) COMMENT '数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) COMMENT='用户采购清单表';
