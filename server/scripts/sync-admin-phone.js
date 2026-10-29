const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function syncAdminPhone() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/markethub');
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    role: String,
    phone: String,
    name: String,
  }));

  const adminPhone = process.env.ADMIN_PHONE_NUMBER || '+923340686111';
  const result = await User.updateMany(
    { role: 'admin' },
    { $set: { phone: adminPhone } }
  );

  console.log('Admin phone update result:', result);
  const admins = await User.find({ role: 'admin' });
  console.log('Admin users in DB:', admins);
  process.exit(0);
}

syncAdminPhone().catch(console.error);
