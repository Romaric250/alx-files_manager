#!/usr/bin/node

const { pwdHashed } = require('./utils');
const mongo = require('mongodb');
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;

    this.isConnected = false;
    this.mongoClient = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.mongoClient.connect().then(() => {
      this.isConnected = true;
    }).catch((err) => console.log(err.message));

    this.db = this.mongoClient.db(dbName);
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const userCount = await this.db.collection('users').countDocuments();
    return userCount;
  }

  async nbFiles() {
    const fileCount = await this.db.collection('files').countDocuments();
    return fileCount;
  }

  async createUser(email, password) {
    const hashedPassword = pwdHashed(password);
    const newUser = await this.db.collection('users').insertOne({ email, password: hashedPassword });
    return newUser;
  }

  
  async getUserById(id) {
    const objectId = new mongo.ObjectID(id);
    const user = await this.db.collection('users').findOne({ _id: objectId });
    return user;
  }
  async userExists(email) {
    const user = await this.getUser(email);
    return Boolean(user);
  }
  async getUser(email) {
    const user = await this.db.collection('users').findOne({ email });
    return user;
  }

}

const dbClient = new DBClient();
module.exports = dbClient;