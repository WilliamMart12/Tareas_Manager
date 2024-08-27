import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', time: '' });
    const [totalTime, setTotalTime] = useState(0);
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/tasks');
            setTasks(response.data);
            calculateTotalTime(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const calculateTotalTime = (tasks) => {
        const total = tasks.reduce((sum, task) => sum + parseInt(task.time, 10), 0);
        setTotalTime(total);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleAddTask = async () => {
        try {
            const response = await axios.post('http://localhost:3001/tasks', {
                ...newTask, id: Date.now().toString()
            });
            const updatedTasks = [...tasks, response.data];
            setTasks(updatedTasks);
            calculateTotalTime(updatedTasks);
            setNewTask({ title: '', time: '' });
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/tasks/${id}`);
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            calculateTotalTime(updatedTasks);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = async (id) => {
        const taskToEdit = tasks.find(task => task.id === id);
        const updatedTask = { ...taskToEdit, ...editingTask };
        try {
            await axios.put(`http://localhost:3001/tasks/${id}`, updatedTask);
            const updatedTasks = tasks.map(task => (task.id === id ? updatedTask : task));
            setTasks(updatedTasks);
            calculateTotalTime(updatedTasks);
            setEditingTask(null);
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} horas y ${remainingMinutes} minutos`;
    };

    return (
        <div className="App">
            <h1>Tareas Manager</h1>
            <div className="task-form">
                <input
                    type="text"
                    name="title"
                    placeholder="Tarea"
                    value={newTask.title}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="time"
                    placeholder="Tiempo en minutos"
                    value={newTask.time}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddTask}>Añadir Tarea</button>
            </div>
            <h2>Tiempo Total Minutos: {totalTime} minutos</h2>
            <h2>Tiempo Total Horas: {formatTime(totalTime)}</h2>
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id}>
                        {editingTask && editingTask.id === task.id ? (
                            <>
                                <input
                                    type="text"
                                    name="title"
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                />
                                <input
                                    type="number"
                                    name="time"
                                    value={editingTask.time}
                                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                                />
                                <button onClick={() => handleEditTask(task.id)}>Guardar</button>
                                <button onClick={() => setEditingTask(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                {task.title} - {task.time} minutos
                                <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>Eliminar</button>
                                <button className="edit-button" onClick={() => setEditingTask(task)}>Editar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
