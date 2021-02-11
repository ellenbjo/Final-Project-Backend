import mongoose from 'mongoose'

const Product = new mongoose.model('Product', {
  name: String,
  price: Number,
  dimensions: String,
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  category: String,
  imageUrl: String
})

export default Product
