const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;



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

app.get('/Bilad/getCourses', async (req, res) => {
    const filePath = path.join(__dirname, 'courses.json');
    const jsonData = await readJsonFile(filePath);

    res.json(jsonData);
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

app.use(express.json());

app.post('/Bilad/createUser', async (req, res) => {
    const filePath = path.join(__dirname, 'users.json');
    const newUser = req.body;
    try {
        let users = [];
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            users = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error reading file', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }

        users.push(newUser);

        await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2));
        res.status(200).json({ message: 'User added successfully' });
    } catch (err) {
        console.error('Error writing to file', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.use(bodyParser.json());

const getUsers = () => {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  };
const users = getUsers();

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(
            (user) =>
                user.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(401).send('Invalid username or email combination');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid password combination');
        }
        const payload = { userId: user.id };
        const token = jwt.sign(payload, "3f40d5c9d3a3f4408d3", { expiresIn: '1h' }); 
        userName=user.username;
        Email=user.email;

        res.json({ token ,userName,Email});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
      }
  
      const userExists = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase()
      );
  
      if (userExists) {
        return res.status(409).send('Username or email already exists');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword,
      };
  
      users.push(newUser);
      writeUsers(users);
  
      res.status(201).send('User registered successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

app.listen(port, async () => {
    password1 = bcrypt.hashSync('password456', 10)
    console.log(`Server running on http://localhost:${port}`);
});
