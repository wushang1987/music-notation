import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

const ensureEnv = () => {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music-notation';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
};

// 在所有测试开始前连接数据库
beforeAll(async () => {
  ensureEnv();
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'music-notation-test',
  });
});

// 在所有测试结束后关闭连接
afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.connection.close();
});

// 每个测试用例执行后清理集合数据
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

