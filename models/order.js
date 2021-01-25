import mongoose from 'mongoose'

const Order = new mongoose.model('Order', {
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],
})

export default Order
 