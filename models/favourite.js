import mongoose from 'mongoose'

const Favourite = new mongoose.model('Favourite', {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  product: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    imageUrl: String,
  },
})

export default Favourite
 