import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
      }
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Hash password with cost factor of 12
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get cart total
userSchema.methods.getCartTotal = function() {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
};

// Clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Add item to cart
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItemIndex = this.cart.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    this.cart[existingItemIndex].quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }

  return this.save();
};

// Remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Update cart item quantity
userSchema.methods.updateCartItemQuantity = function(productId, quantity) {
  const itemIndex = this.cart.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.cart.splice(itemIndex, 1);
    } else {
      this.cart[itemIndex].quantity = quantity;
    }
  }

  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
