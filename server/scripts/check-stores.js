const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Store = require('../models/Store');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const stores = await Store.find({});
  console.log('Stores count:', stores.length);
  stores.forEach(s => console.log(s._id.toString(), s.name, s.slug));
  const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
  console.log('Admin:', admin?.email, admin?._id.toString());
  process.exit(0);
}

main();
