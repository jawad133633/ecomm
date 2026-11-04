process.env.NODE_ENV = "test";
const mongoose = require("mongoose");

let mongoServer = null;

// Disable Mongoose query buffering in tests so disconnected operations fail immediately instead of hanging
mongoose.set("bufferCommands", false);

// Allow ample timeout for test environment
if (typeof jest !== "undefined") {
  jest.setTimeout(30000);
}

beforeAll(async () => {
  // 1. If test database URI is explicitly provided
  const testUri = process.env.MONGO_TEST_URI;
  if (testUri) {
    try {
      await mongoose.connect(testUri, { dbName: "markethub_test" });
      console.log("Connected to test database via MONGO_TEST_URI");
      return;
    } catch (err) {
      console.warn("Could not connect to MONGO_TEST_URI:", err.message);
    }
  }

  // 2. Only attempt MongoMemoryServer if requested or in CI with binary present
  if (process.env.USE_MONGO_MEMORY === "true") {
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri, { dbName: "markethub_test" });
      console.log("Test MongoDB Memory Server connected");
      return;
    } catch (err) {
      console.warn("MongoMemoryServer not available:", err.message);
    }
  }

  // Fallback: fast isolated test mode
  // console.log("Test suite initialized in fast mock/isolated mode.");
});

afterEach(async () => {
  // Only attempt collection cleanups if mongoose is actively connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const collection of Object.values(collections)) {
        await collection.deleteMany({});
      }
    } catch (err) {
      // Ignore cleanup error if already closed
    }
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    // Ignore teardown errors
  }
});
