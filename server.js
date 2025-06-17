// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const http = require('http');
// const { Server } = require('socket.io');

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*', methods: ['GET', 'POST'] }
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Route Imports
// const contractRoutes = require('./routes/contractRoutes');            // no socket needed
// const shipmentRoutes = require('./routes/shipmentRoutes');       // socket needed
// const authRoutes = require('./routes/authRoutes');
//       // export with router
// const adminRoutes = require('./routes/adminRoutes');                  // basic export

// // Route Use
// const contractAlertRoutes = require('./routes/contractAlertRoutes');
// app.use('/api', contractAlertRoutes);

// app.use('/api/stats', require('./routes/stats'));

// app.use('/api/admin', adminRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/contracts', contractRoutes);
// app.use('/api/shipments', shipmentRoutes);

// // Server Start
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://task-frontend-khaki-phi.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'https://task-frontend-wsb5.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.io Events
io.on('connection', (socket) => {
  console.log('✅ Socket.io client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket.io client disconnected:', socket.id);
  });

  // Add more socket events if needed
});

app.set('io', io); // Makes io accessible in routes via req.app.get('io')

// Route Imports
const contractRoutes = require('./routes/contractRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contractAlertRoutes = require('./routes/contractAlertRoutes');
const statsRoutes = require('./routes/stats');

// Route Use
app.use('/api', contractAlertRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/shipments', shipmentRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
