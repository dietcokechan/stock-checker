const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const stockLikeSchema = new Schema({
	stock:{ type : String , unique : true },
	likes:{type: Number, default:0},
	ips:{type:Array, default:[]}
	
		
})

const StockLike = mongoose.model('StockLike', stockLikeSchema)

module.exports = StockLike;