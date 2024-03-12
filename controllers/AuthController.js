import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  static async getConnect(req, res) {
    const auth = req.header('Authorization').split(' ')[1];
    const [email, password] = Buffer.from(auth, 'base64').toString('ascii').split(':');
   
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.dbClient.collection('users').findOne({ email, password: sha1(password) });
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
    
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).end(); 
  }
}

export default AuthController;