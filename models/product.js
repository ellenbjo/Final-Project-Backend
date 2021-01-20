import mongoose from 'mongoose'

//add pcs in stock to the product model?
//add uploadedAt? 
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
