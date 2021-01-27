import mongoose from 'mongoose'

const Order = new mongoose.model('Order', {
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      quantity: Number,
    }
  ],
})

export default Order
 