const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(cors({
    origin: 'https://tareas-manager-front.onrender.com', // URL de tu frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type,Authorization', // Encabezados permitidos
}));

app.use(express.json());

app.get('/tasks', (req, res) => {
    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const tasks = JSON.parse(data);
        res.json(tasks);
    });
});

app.post('/tasks', (req, res) => {
    const newTask = req.body;
    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const tasks = JSON.parse(data);
        tasks.push(newTask);
        fs.writeFile(tasksFilePath, JSON.stringify(tasks), 'utf8', (err) => {
            if (err) {
                console.error('Error writing tasks file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json(newTask);
        });
    });
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const tasks = JSON.parse(data);
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        fs.writeFile(tasksFilePath, JSON.stringify(updatedTasks), 'utf8', (err) => {
            if (err) {
                console.error('Error writing tasks file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ success: true });
        });
    });
});

app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const updatedTask = req.body;
    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const tasks = JSON.parse(data);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask }; // Asegura que solo se actualicen los campos necesarios
            fs.writeFile(tasksFilePath, JSON.stringify(tasks), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing tasks file:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json(tasks[taskIndex]);
            });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
