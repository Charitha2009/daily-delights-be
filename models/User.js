// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, required: true},
    quantity: { type: Number, required: true, default: 1 }
  }]
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare entered password with the hashed password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
