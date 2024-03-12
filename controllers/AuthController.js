// AuthController.js
const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf8').split(':');
    const email = credentials[0];
    const password = crypto.createHash('sha1').update(credentials[1]).digest('hex');

    const user = await dbClient.getUser(email);
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
}

module.exports = AuthController;