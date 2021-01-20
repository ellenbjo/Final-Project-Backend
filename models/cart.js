import mongoose from 'mongoose'

const Order = new mongoose.model('Order', {
  items: [
    {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
      },
    }
  ]
}

//Could i connect this to the product model? 
//Could the products be added to an array in the cart model instead?
const CartItem = new mongoose.model('CartItem', {
  imageUrl: String,
  name: String,
  quantity: {
    type: Number,
    default: 1
  },
  price: Number
})
 
export default CartItem

/*const Order = new mongoose.model('Order', {
  userId: String/connect to Usermodel?,
  products: []
})*/

const Order = new mongoose.model('Order', {
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  quantity: Number,
  totalPrice: Number
})
 