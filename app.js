const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer')
const upload = multer();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(upload.array());

const jwtSecret = 'your-secret-key';

async function readJsonFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading the JSON file:', err);
        throw err;
    }
}

function readUsers() {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

const authenticateToken = (req, res, next) => { 
    const authHeader = req.headers["authorization"]; 
    const token = authHeader && authHeader.split(" ")[1]; 
    if (token === null) return res.status(401).json({ msg: "Not Authorized" }); 
    jwt.verify(token, jwtSecret, (err, user) => { 
      if (err) return res.status(401).json({ msg: err }); 
      req.user = user; 
      next(); 
    }); 
  }; 

app.get('/Bilad/getCourses', async (req, res) => {
    const filePath = path.join(__dirname, 'courses.json');
    const jsonData = await readJsonFile(filePath);

    res.json(jsonData);
  });
app.get('/Bilad/about', async (req, res) => {
    const filePath = path.join(__dirname, 'about.json');
    const jsonData = await readJsonFile(filePath);

    res.json(jsonData);
});
app.get('/Bilad/getCourse/:id', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'courses1.json');
        const jsonData = await readJsonFile(filePath);

        const CourseId = parseInt(req.params.id);

        const data = jsonData.find(course => course.id === CourseId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const users = readUsers();
    users.push({ username, password: hashedPassword, email });
    writeUsers(users);
    res.send('Registration successful!');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '1h' });
        const email = user.email;
        const success = true;
        res.set('Authorization', `Bearer ${accessToken}`);
        res.json({ success, accessToken, username, email });
        console.log(accessToken)
    } else {
        res.send('Invalid username or password.');
    }
   
});

app.get('/me',authenticateToken, (req, res) => {
    const { username } = req.body;
    const users = readUsers();
    const currentUser = users.find(u => u.username === username);
    if (!currentUser) {
        return res.status(404).send('User not found.');
    }
    res.json({
        username: currentUser.username,
        email: currentUser.email
    });
});
app.listen(port, async () => {
    password1 = bcrypt.hashSync('password456', 10)
    console.log(`Server running on http://localhost:${port}`);
});
