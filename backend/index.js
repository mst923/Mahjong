const express = require('express');
const bcrypt = require('bcrypt');
const { User, sequelize } = require('./models/index');
const Statistics3 = require('./models/Statistics3')
const Statistics4 = require('./models/Statistics4')

const app = express();
const child_tsumo_scores = require('./child_tsumo_scores.json');
const child_ron_scores = require('./child_ron_scores.json')
const parent_tsumo_scores = require('./parent_tsumo_scores.json')
const parent_ron_scores = require('./parent_ron_scores.json')

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

app.get('/api/child_tsumo_scores', (req, res) => {
  res.json(child_tsumo_scores);
});


app.get('/api/child_ron_scores', (req, res) => {
  res.json(child_ron_scores)
})

app.get('/api/parent_tsumo_scores', (req, res) => {
  res.json(parent_tsumo_scores)
})


app.get('/api/parent_ron_scores', (req, res) => {
  res.json(parent_ron_scores)
})

app.get('/api/statistics4', async (req, res) => {
  try {
    const statistics4 = await Statistics4.findAll();
    res.status(200).json(statistics4);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/statistics3', async (req, res) => {
  try {
    const statistics3 = await Statistics3.findAll();
    res.status(200).json(statistics3);
  } catch (error) {
    res.status(500).json({ error : error.message})
  }
});

app.get('/api/statistics4/:userId', async (req, res) =>{
  try {
    const statistics4 = await Statistics4.findOne({ where: { userId: req.params.userId } });
    if (statistics4) {
      // インスタンスをJSONに変換してgetterの値を含める
      // const statsJson = statistics4.toJSON();
      
      // res.status(200).json(statsJson);
      res.json({
        ...statistics4.toJSON(),
        agariRate: statistics4.agariRate,
        riichiRate: statistics4.riichiRate,
        riichiAgariRate: statistics4.riichiAgariRate,
        hojuRate: statistics4.hojuRate,
        averageHojuPoints: statistics4.averageHojuPoints,
        topRate: statistics4.topRate,
        secondRate: statistics4.secondRate,
        thirdRate: statistics4.thirdRate,
        lastRate: statistics4.lastRate,
        hakoshitaRate: statistics4.hakoshitaRate,
        averageAgariPoints: statistics4.averageAgariPoints,
        // averageRank: statistics4.averageRank,
        tsumoAgariRate: statistics4.tsumoAgariRate
      });
    } else {
      res.status(404).json({ error: 'Statistics4 not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

app.post('/api/statistics4', async (req, res) => {
  try {
    // console.log(req.body)
    const statisticsArray = req.body;
    const results = await Promise.all(statisticsArray.map(async stats => {
      const { userId, totalMatches, totalRounds, agariCount, riichiCount,
      riichiAgariCount, totalAgariPoints, totalHojuCount, totalHojuPoints,
      tsumoAgariCount, topCount, secondCount, thirdCount, lastCount, 
      hakoshitaCount, totalPoints } = stats;
      // console.log(userId)
      // console.log(totalPoints)
      return await Statistics4.upsert({
        userId,
        totalMatches,
        totalRounds,
        agariCount,
        riichiCount,
        riichiAgariCount,
        totalAgariPoints,
        totalHojuCount,
        totalHojuPoints,
        tsumoAgariCount,
        topCount,
        secondCount,
        thirdCount,
        lastCount, 
        hakoshitaCount,
        totalPoints,
      });
    }));
    res.status(201).json(results);
  } catch (error) {
    console.error('Error saving statistics:', error.errors ? error.errors.map(e => e.message) : error.message);
    res.status(500).json({ error: error.errors ? error.errors.map(e => e.message) : error.message });
  }
});

app.get('/api/statistics3/:userId', async (req, res) =>{
  try {
    const statistics3 = await Statistics3.findOne({ where: { userId: req.params.userId } });
    if (statistics3) {
      res.json({
        ...statistics3.toJSON(),
        agariRate: statistics3.agariRate,
        riichiRate: statistics3.riichiRate,
        riichiAgariRate: statistics3.riichiAgariRate,
        hojuRate: statistics3.hojuRate,
        averageHojuPoints: statistics3.averageHojuPoints,
        topRate: statistics3.topRate,
        secondRate: statistics3.secondRate,
        thirdRate: statistics3.thirdRate,
        lastRate: statistics3.lastRate,
        hakoshitaRate: statistics3.hakoshitaRate,
        averageAgariPoints: statistics3.averageAgariPoints,
        // averageRank: statistics4.averageRank,
        tsumoAgariRate: statistics3.tsumoAgariRate
      });
      // res.status(200).json(statistics3);
    } else {
      res.status(404).json({ error: 'Statistics3 not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


app.post('/api/statistics3', async (req, res) => {
  try {
    // console.log(req.body)
    const statisticsArray = req.body;
    const results = await Promise.all(statisticsArray.map(async stats => {
      const { userId, totalMatches, totalRounds, agariCount, riichiCount,
      riichiAgariCount, totalAgariPoints, totalHojuCount, totalHojuPoints,
      tsumoAgariCount, topCount, secondCount, lastCount, 
      hakoshitaCount, totalPoints } = stats;
      return await Statistics3.upsert({
        userId,
        totalMatches,
        totalRounds,
        agariCount,
        riichiCount,
        riichiAgariCount,
        totalAgariPoints,
        totalHojuCount,
        totalHojuPoints,
        tsumoAgariCount,
        topCount,
        secondCount,
        lastCount, 
        hakoshitaCount,
        totalPoints,
      });
    }));
    res.status(201).json(results);
  } catch (error) {
    console.error('Error saving statistics:', error.errors ? error.errors.map(e => e.message) : error.message);
    res.status(500).json({ error: error.errors ? error.errors.map(e => e.message) : error.message });
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
