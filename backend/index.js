const express = require('express');
const bcrypt = require('bcrypt');
const { User, sequelize } = require('./models');

const app = express();
const port = 3001;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello from the backend!' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Received registration request: username=${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password: ${hashedPassword}`);
    const newUser = await User.create({ username, password: hashedPassword });
    console.log(`User created: ${newUser}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server is running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });
