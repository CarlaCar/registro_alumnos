const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
app.use(cors());
app.use(express.json());

const API_KEY = "12345ABCDEF";

// Middleware de autenticación simple
app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized. Invalid API Key." });
    }
    next();
});

// Endpoint para obtener alumnos
app.get('/api/students', (req, res) => {
    const data = fs.readFileSync('students.json', 'utf8');
    const students = JSON.parse(data);
    res.json(students);
});

// ============================
// Endpoints
// ============================

// Registrar nuevo estudiante
app.post('/api/students', (req, res) => {
    const { name, career } = req.body;

    if (!name || !career) {
        return res.status(400).json({ error: "Missing required fields: name and career." });
    }

    const newStudentId = students.length ? students[students.length - 1].id + 1 : 1;

    const newStudent = {
        id: newStudentId,
        name,
        career
    };

    students.push(newStudent);
    saveStudents(students); // Guardar cambios

    return res.status(201).json({ message: "Student registered successfully.", student: newStudent });
});

// Consultar estudiante por ID
app.get('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({ error: "Student not found." });
    }

    return res.status(200).json(student);
});

// Consultar estudiantes por carrera
app.get('/api/students', (req, res) => {
    const career = req.query.career;

    if (career) {
        const filtered = students.filter(s => s.career.toLowerCase() === career.toLowerCase());
        return res.status(200).json(filtered);
    }

    // Si no hay filtro, devuelve todos los alumnos
    return res.status(200).json(students);
});

// Eliminar estudiante por ID
app.delete('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Student not found for deletion." });
    }

    students.splice(index, 1);
    saveStudents(students); // Guardar cambios

    return res.status(200).json({ message: "Student deleted successfully." });
});

// CRUD para carrera
// Registrar nueva carrera
app.post('/api/careers', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing required field: name." });
    }

    const existingCareer = careers.find(c => c.name.toLowerCase() === name.toLowerCase());
    
    if (existingCareer) {
        return res.status(409).json({ error: "Career already exists." });
    }

    const newCareersId = careers.length ? careers[careers.length - 1].id + 1 : 1;

    // Logica para guardar la carrera en el archivo o base de datos
    const newCareer = {
        id: newCareersId,
        name
    };

    careers.push(newCareer);
    saveCareers(careers); // Guardar cambios

    return res.status(201).json({ message: "Career registered successfully.", career: { name } });
});

// Consultar carrera por ID
app.get('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const career = careers.find(c => c.id === id);

    if (!career) {
        return res.status(404).json({ error: "Career not found." });
    }

    return res.status(200).json(career);
});

// Consultar todas las carreras
app.get('/api/careers', (req, res) => {
    const careerName = req.query.name;

    if (careerName) {
        const filteredCareers = careers.filter(c => c.name.toLowerCase() === careerName.toLowerCase());
        return res.status(200).json(filteredCareers);
    }
    return res.status(200).json(careers);
});

// Borrar carrera por ID
app.delete('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id); 
    const index = careers.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Career not found for deletion." });
    }

    // Verificar si hay estudiantes asociados a la carrera
    const studentsInCareer = students.filter(s => s.career.toLowerCase() === careers[index].name.toLowerCase());
    if (studentsInCareer.length > 0) {
        return res.status(400).json({ error: "Cannot delete career with associated students." });
    }

    careers.splice(index, 1);
    saveCareers(careers); // Guardar cambios

    return res.status(200).json({ message: "Career deleted successfully." });
});


//CRUD para categorías de carreras
app.post('/api/categories', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing required field: name." });
    }

    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());

    const newCategoryId = categories.length ? categories[categories.length - 1].id + 1 : 1;

    const newCategory = {
        id: newCategoryId,
        name
    };

    categories.push(newCategory);
    saveCategories(categories); // Guardar cambios

    return res.status(201).json({ message: "Career category registered successfully.", category: { name } });
});

// Consultar categoría de carrera por ID
app.get('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const category = categories.find(c => c.id === id);

    if (!category) {
        return res.status(404).json({ error: "Career category not found." });
    }

    return res.status(200).json(category);
});

// Consultar todas las categorías de carreras
app.get('/api/categories', (req, res) => {
    const categoryName = req.query.name;

    if (categoryName) {
        const filteredCategories = categories.filter(c => c.name.toLowerCase() === categoryName.toLowerCase());
        return res.status(200).json(filteredCategories);
    }
    return res.status(200).json(categories);
});

// Borrar categoría de carrera por ID
app.delete('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Career category not found for deletion." });
    }

    // Verificar si hay carreras asociadas a la categoría
    const categoriesInCategory = categories.filter(c => c.categoryId === id);
    if (categoriesInCategory.length > 0) {
        return res.status(400).json({ error: "Cannot delete category with associated categories." });
    }

    categories.splice(index, 1);
    saveCategories(categories); // Guardar cambios

    return res.status(200).json({ message: "Career category deleted successfully." });
});

// ============================
// Start server
// ============================
const PORT = 5001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

let students = [];
let careers = [];
let categories = [];

// Cargar datos al iniciar el servidor
try {
    students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
} catch (e) {
    students = [];
}
try {
    careers = JSON.parse(fs.readFileSync('careers.json', 'utf8'));
} catch (e) {
    careers = [];
}
try {
    categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
} catch (e) {
    categories = [];
}

// Funciones para guardar cambios
function saveStudents(data) {
    fs.writeFileSync('students.json', JSON.stringify(data, null, 2));
}
function saveCareers(data) {
    fs.writeFileSync('careers.json', JSON.stringify(data, null, 2));
}
function saveCategories(data) {
    fs.writeFileSync('categories.json', JSON.stringify(data, null, 2));
}
