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
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Route Imports
const contractRoutes = require('./routes/contractRoutes');            // no socket needed
const shipmentRoutes = require('./routes/shipmentRoutes');       // socket needed
const authRoutes = require('./routes/authRoutes');
      // export with router
const adminRoutes = require('./routes/adminRoutes');                  // basic export

// Route Use
const contractAlertRoutes = require('./routes/contractAlertRoutes');
app.use('/api', contractAlertRoutes);

app.use('/api/stats', require('./routes/stats'));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/shipments', shipmentRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
