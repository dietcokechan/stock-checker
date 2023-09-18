const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
	suite('GET /api/stock-prices => stockData object', function() {
		test('1 stock', function (done) {
			chai.request(server)
			.get('/api/stock-prices')
			.query({stock: 'goog'})
			.end(function(err, res)
			{

				done();
			});
		});

		test('1 stock with like', function(done) {
			chai.request(server)
			.get('/api/stock-prices')
			.query({stock: 'goog'})
			.end(function(err, res)
			{

				done();
			});
		});

		test('1 stock with like again (ensure likes arent double counted)', function(done) {
			chai.request(server)
			.get('/api/stock-prices')
			.query({stock: 'goog'})
			.end(function(err, res)
			{

				done();
			});
		});

		test('2 stocks', function(done) {
			chai.request(server)
			.get('/api/stock-prices')
			.query({stock: 'goog'})
			.end(function(err, res)
			{

				done();
			});
		});

		test('2 stocks with like', function(done) {
			chai.request(server)
			.get('/api/stock-prices')
			.query({stock: 'goog'})
			.end(function(err, res)
			{
				
				done();
			});
		});

	})
});
