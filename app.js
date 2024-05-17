const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

async function readJsonFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading the JSON file:', err);
        throw err;
    }
}

app.post('/Bilad/createCourse', async(req, res) => {
    const filePath = path.join(__dirname, 'courses.json');
    const jsonData = await readJsonFile(filePath);
    const course = req.body;
    course.id = nextUserId++;
    jsonData.push(course);
    res.status(201).json(course);
});

app.get('/Bilad/getCourse/:id', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'courses.json');
        const jsonData = await readJsonFile(filePath);

        const CourseId = parseInt(req.params.id);

        const data = jsonData.find(course => course.id === CourseId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/Bilad/updateCourse', async (req, res) => {
    const filePath = path.join(__dirname, 'courses.json');
    const jsonData = await readJsonFile(filePath);

    const CourseId = parseInt(req.params.id);
    const updateCourse = req.body;
    let course = jsonData.find(course => course.id === CourseId);
    if (!course) {
        return res.status(404).json({ message: 'course not found' });
    }
    course = { ...course, ...updateCourse };
    res.json(course);
});

app.delete('/Bilad/deleteCourse/:id', async (req, res) => {
    const filePath = path.join(__dirname, 'courses.json');
    const jsonData = await readJsonFile(filePath);

    const CourseId = parseInt(req.params.id);
    const courseIndex = jsonData.findIndex(course => course.id === CourseId);
    if (courseIndex === -1) {
        return res.status(404).json({ message: 'course not found' });
    }
    jsonData.splice(courseIndex, 1);
    res.sendStatus(204);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

