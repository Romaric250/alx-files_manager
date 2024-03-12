const dbClient = require('../utils/db');

class UsersController {

  static async postNew(req, res) {
    const { email, password } = req.body;
    
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      res.end();
      return;
    }
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      res.end();
      return;
    }
    const userExist = await dbClient.userExist(email);
    if (userExist) {
      res.status(400).json({ error: 'Already exist' });
      res.end();
      return;
    }
    const user = await dbClient.createUser(email, password);
    const id = `${user.insertedId}`;
    res.status(201).json({ id, email });
    res.end();
  }
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

module.exports = UsersController;