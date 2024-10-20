// const express = require('express');
// const mongoose = require('mongoose');
// const axios = require('axios');

// const app = express();
// const port = process.env.PORT || 3001;

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/transaction_db', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Define the transaction schema
// const transactionSchema = new mongoose.Schema({
//   id: Number,
//   title: String,
//   description: String,
//   price: Number,
//   category: String,
//   sold: Boolean,
//   image: String,
//   dateOfSale: Date
// });

// const Transaction = mongoose.model('Transaction', transactionSchema);

// // Fetch and initialize database with seed data
// const fetchAndInitialize = async () => {
//   try {
//     const response = await axios.get('https://s3.amazonaws.com/roxilier.com/product_transaction.json');
//     const transactions = response.data;

//     // Convert date strings to Date objects
//     transactions.forEach(transaction => {
//       transaction.dateOfSale = new Date(transaction.dateOfSale);
//     });

//     await Transaction.insertMany(transactions);
//     console.log('Database initialized with seed data');
//   } catch (error) {
//     console.error('Error fetching or initializing data:', error);
//   }
// };

// // List transactions API
// app.get('/transactions', async (req, res) => {
//   const { month, search, page = 1, perPage = 10 } = req.query;

//   const query = { dateOfSale: { $month: parseInt(month) } };

//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: 'i' } },
//       { description: { $regex: search, $options: 'i' } },
//       { price: { $regex: search, $options: 'i' } }
//     ];
//   }

//   try {
//     const total = await Transaction.countDocuments(query);
//     const transactions = await Transaction.find(query)
//       .skip((page - 1) * perPage)
//       .limit(perPage);

//     res.json({ transactions, total });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch transactions' });
//   }
// });

// // Statistics API
// app.get('/statistics', async (req, res) => {
//   const { month } = req.query;

//   try {
//     const totalSaleAmount = await Transaction.aggregate([
//       { $match: { dateOfSale: { $month: parseInt(month) } } },
//       { $group: { _id: null, totalSaleAmount: { $sum: '$price' } } }
//     ]).then(result => result[0]?.totalSaleAmount || 0);

//     const totalSoldItems = await Transaction.countDocuments({
//       dateOfSale: { $month: parseInt(month) },
//       sold: true
//     });

//     const totalNotSoldItems = await Transaction.countDocuments({
//       dateOfSale: { $month: parseInt(month) },
//       sold: false
//     });

//     res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch statistics' });
//   }
// });

// // Bar chart API
// app.get('/bar-chart', async (req, res) => {
//   const { month } = req.query;

//   try {
//     const priceRanges = [
//       { $match: { dateOfSale: { $month: parseInt(month) }, price: { $lte: 100 } } },
//       { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 100, $lte: 200 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 200, $lte: 300 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 300, $lte: 400 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 400, $lte: 500 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 500, $lte: 600 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 600, $lte: 700 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 700, $lte: 800 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 800, $lte: 900 } } },
    //   { $match: { dateOfSale: { $month: parseInt(month) }, price: { $gt: 900 } } }


      
//       // ... other price ranges
//     ];

//     const results = await Promise.all(priceRanges.map(range => Transaction.countDocuments(range)));

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch bar chart data' });
//   }
// });

// // Pie chart API
// app.get('/pie-chart', async (req, res) => {
//   const { month } = req.query;

//   try {
//     const results = await Transaction.aggregate([
//       { $match: { dateOfSale: { $month: parseInt(month) } } },
//       { $group: { _id: '$category', count: { $sum: 1 } } }
//     ]);

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch pie chart data' });
//   }
// });

// // Combined API
// app.get('/combined', async (req, res) => {
//   const { month } = req.query;

//   try {
//     const [transactions, statistics, barChartData, pieChartData] = await Promise.all([
//       axios.get(`/transactions?month=${month}`),
//       axios.get(`/statistics?month=${month}`),
//       axios.get(`/bar-chart?month=${month}`),
//       axios.get(`/pie-chart?month=${month}`)
//     ]);

//     res.json({
//       transactions: transactions.data,
//       statistics: statistics.data,
//       barChartData: barChartData.data,
//       pieChartData: pieChartData.data
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch combined data' });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);

//   // Fetch and initialize database
//   fetchAndInitialize();
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');



const app = express();

require('dotenv').config();
const port = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json())

const thirdPartyUrl = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';


app.get('/transactions', async (req, res) => {
    try {
      const response = await axios.get(thirdPartyUrl);
      res.json(response.data); // Forward the data to the frontend
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});