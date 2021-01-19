import mongoose from 'mongoose'

const Designer = new mongoose.model('Product', {
  name: String,
})

export default Product