const express = require('express')
const router = express.Router()
const userController = require('../controllers/controller');
const upload = require('../lib/multer');


// Retrieve all users
router.get('/agg', userController.aggre);

// Create a new user
router.post('/', upload.single('csvFile'), userController.create);

// Retrieve a single user with id
router.get('/', userController.findOne);


// Inser a data at specific time
router.post('/insert', userController.atTimeInsert);

// Delete a user with id
//router.delete('/:id', userController.delete);

module.exports = router