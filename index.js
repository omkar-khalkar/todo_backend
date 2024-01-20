const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TodoModel = require("./models/Todo")
const dotenv = require("dotenv")
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(`${MONGO_URI}`).then(result => console.log("MongoDB connected"));

app.post('/add', (req, res) => {
    const task = req.body.task;
    TodoModel.create({
        task: task
    }).then(result => res.json(result))
        .catch(err => res.json(err))
});

app.get('/tasks', (req, res) => {
    TodoModel.find()
        .then(result => res.json(result))
        .catch(err => res.json(err))
});

app.put('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { task, completed } = req.body;

    try {
        const updatedFields = {};
       
        if (task !== undefined) {
            updatedFields.task = task;
        }
        if (completed !== undefined) {
            updatedFields.completed = completed;
        }

       
        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updatedTodo = await TodoModel.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: `Task with ID ${id} not found` });
        }

        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;

   
    TodoModel.deleteOne({ _id: id })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ message: `Deleted task with ID ${id}` });
            } else {
                res.status(404).json({ message: `Task with ID ${id} not found` });
            }
        })
        .catch(err => res.json(err));
});



app.listen(PORT, () => {
    console.log('Server listening on port 3001');
});