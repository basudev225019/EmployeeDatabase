// Task1: initiate app and run server at 3000
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection
// The Atlas connection string is read from the MONGODB_URI environment variable so credentials are not stored in the code.
const MONGODB_URI = process.env.MONGODB_URI;

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: String, required: true, trim: true }
}, { versionKey: false });

const Employee = mongoose.model('Employee', employeeSchema, 'employeelist');

const isValidId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Set it to your MongoDB Atlas connection string and restart the server.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    });


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below



//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
    }
});


//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee id' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
    }
});


//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        const employee = await Employee.create({ name, location, position, salary });
        res.status(201).json(employee);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid employee data', error: err.message });
        }
        res.status(500).json({ message: 'Failed to add employee', error: err.message });
    }
});


//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee id' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted', employee });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete employee', error: err.message });
    }
});


//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, name, location, position, salary } = req.body;
        if (!isValidId(_id)) {
            return res.status(400).json({ message: 'Invalid employee id' });
        }
        const employee = await Employee.findByIdAndUpdate(
            _id,
            { name, location, position, salary },
            { returnDocument: 'after', runValidators: true }
        );
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid employee data', error: err.message });
        }
        res.status(500).json({ message: 'Failed to update employee', error: err.message });
    }
});


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});



