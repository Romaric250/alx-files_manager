#!/usr/bin/node
const express = require('express');

const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/users', UsersController.postNew);
router.get('/status', AppController.getStatus);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', AuthController.getMe);
router.post('/files', AppController.postUpload);
router.get('/stats', AppController.getStats);

module.exports = router;