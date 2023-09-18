'use strict';

var expect = require('chai').expect;
var mongoClient = require('mongodb');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const dbconn = process.env.DB;
var monconn = mongoose.connection;
const stockLike = require('./stocklike');
require('dotenv').config();
const path = require('path');

mongoose.connect(dbconn, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB...'))
	.catch((err) => console.log(err));

module.exports = function (app) {

	app.route('/api/stock-prices')
		.get(function (req, res) {

		});

	app.route('/api/stock-prices')
		.get((req, res, next) => {
			const stock = req.query.stock
			console.log(req.query)
			if (!Array.isArray(req.query.stock) && !req.query.like) {  //not array and like=false

				Promise.all([
					fetch(`https://cloud.iexapis.com/stable/stock/${stock}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then((result) => result.json()),
					fetch(`https://fccstockchecker.herokuapp.com/api/info/${stock}`)
						.then((info) => info.json())
				])
					.then(json => res.json({
						stockData: {
							stock: json[0].symbol,
							price: json[0].latestPrice,
							likes: json[1].likes
						}

					})
					)
			} else if (!Array.isArray(req.query.stock) && req.query.like) {   //not array and like=true
				console.log('one')
				Promise.all([
					fetch(`https://cloud.iexapis.com/stable/stock/${stock}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then((result) => result.json())
						.catch((err) => console.log(err)),
					fetch(`https://fccstockchecker.herokuapp.com/api/like/${stock}`)
						.then((stock) => stock.json())
						.catch((err) => console.log(err))
				])
					.then((json) => res.json({
						stockData: {
							stock: json[0].symbol,
							price: json[0].latestPrice,
							likes: json[1].likes
						}
					}))
			}




			else if (Array.isArray(req.query.stock) && req.query.like) {    // is Array and Like=true

				Promise.all([
					fetch(`https://cloud.iexapis.com/stable/stock/${stock[0]}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then(result => result.json()),
					fetch(`https://cloud.iexapis.com/stable/stock/${stock[1]}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then(result => result.json()),
					fetch(`https://fccstockchecker.herokuapp.com/api/like/${stock[0]}`)
						.then((stock) => stock.json())
						.catch((err) => console.log(err)),
					fetch(`https://fccstockchecker.herokuapp.com/api/like/${stock[1]}`)
						.then((stock) => stock.json())
						.catch((err) => console.log(err))
				])
					.then((json) => res.json({
						stockData: [{
							stock: json[0].symbol,
							price: json[0].latestPrice, rel_likes: json[2].likes - json[3].likes
						},
						{
							stock: json[1].symbol,
							price: json[1].latestPrice, rel_likes: json[3].likes - json[2].likes
						}]
					}))





			} else {  //is Array like=false

				Promise.all([
					fetch(`https://cloud.iexapis.com/stable/stock/${stock[0]}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then(result => result.json()),
					fetch(`https://cloud.iexapis.com/stable/stock/${stock[1]}/quote?token=pk_1e07d6c482c14e9aa2fbcfe3c133ba92`)
						.then(result => result.json()),
					fetch(`https://fccstockchecker.herokuapp.com/api/info/${stock[0]}`)
						.then((stock) => stock.json())
						.catch((err) => console.log(err)),
					fetch(`https://fccstockchecker.herokuapp.com/api/info/${stock[1]}`)
						.then((stock) => stock.json())
						.catch((err) => console.log(err))
				])
					.then((json) => res.json({
						stockData: [{
							stock: json[0].symbol,
							price: json[0].latestPrice, rel_likes: json[2].likes - json[3].likes
						},
						{
							stock: json[1].symbol,
							price: json[1].latestPrice, rel_likes: json[3].likes - json[2].likes
						}]
					}))





			}


		})

	app.route('/api/info/:stock')
		.get((req, res) => {
			console.log(req.header('x-forwarded-for'))
			const stock = req.params.stock.toUpperCase()
			console.log(stock)
			StockLike.findOneAndUpdate({ "stock": stock }, { $set: { "stock": stock } }, { upsert: true, new: true })
				.then((stock) => res.json(stock))
		})


	app.route('/api/like/:stock')
		.get((req, res) => {
			const stockName = req.params.stock.toUpperCase()
			const ip = req.ip
			StockLike.findOneAndUpdate({ "stock": stockName }, { $set: { "stock": stockName } }, { upsert: true, new: true })
				.then(stock => StockLike.findOneAndUpdate({ "stock": stockName, ips: { $ne: ip } }, { $push: { "ips": ip }, $set: { "likes": stock.likes + 1 } }, { upsert: true, new: true }))
				.then(nxt => res.json(nxt))
				.catch((err) => StockLike.findOneAndUpdate({ "stock": stockName }, { $set: { "stock": stockName } }, { upsert: true, new: true }))
				.then(stock => res.json(stock))

		})

	app.route('/api/like/:stock')
		.post((req, res) => {
			const stockName = req.params.stock.toUpperCase()
			const stock = new StockLike({
				stock: stockName
			}).save()
				.then((data) => res.json(data))
		})

	app.route('/api/testip/:stock')
		.get((req, res) => {
			const ip = req.ip
			const stockName = req.params.stock.toUpperCase()
			StockLike.find({})
				.then(data => res.json(data))
				.catch((err) => console.log(err))

		})

		;
};
