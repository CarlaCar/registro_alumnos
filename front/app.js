// Archivo: app.js
const API_STUDENTS_URL = 'http://localhost:5001/api/students';
const API_CAREERS_URL = 'http://localhost:5001/api/careers';
const API_CATEGORIES_URL = 'http://localhost:5001/api/categories';
const API_KEY = "12345ABCDEF";

// Headers comunes para todas las peticiones
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
};

function showAlert(message, type = 'info') {
  Swal.fire({
    icon: type,
    title: message,
    timer: 2000,
    showConfirmButton: false
  });
}

// CATEGORÍAS

// =======================
// Función: loadCategories
// Descripción: Carga las categorías desde la API y las muestra en la tabla de categorías.
// =======================
async function loadCategories() {
  try {
    const res = await fetch(API_CATEGORIES_URL, { headers });
    if (!res.ok) throw new Error('No se pudo cargar categorías');
    const categories = await res.json();
    const tbody = document.querySelector('#categoriesTable tbody');
    if (tbody) {
      tbody.innerHTML = '';
      categories.forEach(cat => {
        // Agrega una fila por cada categoría
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${cat.id}</td><td>${cat.name}</td>`;
        tbody.appendChild(tr);
      });
    }
  } catch (e) {
    showAlert(e.message, 'error');
  }
}
// Llama a la función para cargar las categorías al inicio
function registerCategory() {
  // Toma el valor del input si existe, si no el del select
  const inputValue = document.getElementById('newCategoryInput').value.trim();
  const selectValue = document.getElementById('newCategoryName').value;
  const name = inputValue || selectValue;
  const type = document.getElementById('categoryType').value;
  if (!name || !type) {
    Swal.fire({ icon: 'warning', title: 'Complete todos los campos', timer: 2000, showConfirmButton: false });
    return;
  }
  fetch(API_CATEGORIES_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, type }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al agregar categoría');
      return res.json();
    })
    .then(() => {
      document.getElementById('newCategoryInput').value = '';
      loadCategories(); // Actualiza la tabla
      Swal.fire({ icon: 'success', title: 'Categoría agregada correctamente', timer: 2000, showConfirmButton: false });
    })
    .catch(err => {
      Swal.fire({ icon: 'error', title: err.message, timer: 2000, showConfirmButton: false });
    });
}
window.registerCategory = registerCategory;
// =======================
// Función: getCategoryByName
function getCategoryByName() {
  const name = document.getElementById('categorySearch').value.trim();
  const resultDiv = document.getElementById('categorySearchResult');
  if (!name) {
    resultDiv.textContent = 'Por favor, ingrese un nombre de categoría.';
    return;
  }

  fetch(`${API_CATEGORIES_URL}/${encodeURIComponent(name)}`, { headers })
    .then(res => {
      if (res.status === 404) {
        resultDiv.textContent = 'Categoría no encontrada.';
        return null;
      }
      if (!res.ok) throw new Error('Error al buscar categoría');
      return res.json();
    })
    .then(category => {
      if (category)
        resultDiv.textContent = `Categoría: ${category.name} | Tipo: ${category.type ? category.type : 'No especificado'}`;
    })
    .catch(error => {
      resultDiv.textContent = error.message;
    });
}
window.getCategoryByName = getCategoryByName;

async function deleteCategory() {
  const name = document.getElementById('categoryDelete').value.trim();
  if (!name) return showAlert('Ingrese el nombre de la categoría a eliminar', 'warning');

  try {
    const res = await fetch(`${API_CATEGORIES_URL}/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers,
    });
    if (res.status === 404) {
      document.getElementById('categoryDeleteResult').textContent = 'Categoría no encontrada para eliminar';
      return;
    }
    if (!res.ok) throw new Error('Error al eliminar categoría');
    showAlert('Categoría eliminada correctamente', 'success');
    document.getElementById('categoryDelete').value = '';
    loadCategories();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}
window.deleteCategory = deleteCategory;

async function deleteCategoryService(categoryName) {
  // Corrige la URL según tu API
  const response = await fetch(`http://localhost:5001/api/categories/${encodeURIComponent(categoryName)}`, {
    method: 'DELETE'
  });
  return response;
}

// CARRERAS

// Carga y muestra todas las carreras en la tabla con solo ID y nombre
async function loadCareers() {
  const res = await fetch(API_CAREERS_URL, { headers });
  const careers = await res.json();
  const tbody = document.querySelector('#careersTable tbody');
  tbody.innerHTML = '';
  careers.forEach(career => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${career.id}</td><td>${career.name}</td>`;
    tbody.appendChild(tr);
  });
}
// Registra una nueva carrera
async function registerCareer() {
  const inputValue = document.getElementById('careerInput').value.trim();
  const selectValue = document.getElementById('careerName').value;
  const name = inputValue || selectValue;
  if (!name) return showAlert('El nombre de la carrera es obligatorio', 'error');

  try {
    const res = await fetch(API_CAREERS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Error al agregar carrera');
    showAlert('Carrera agregada correctamente', 'success');
    document.getElementById('careerInput').value = '';
    document.getElementById('careerName').value = '';
    loadCareers();
  } catch (error) {
    if (error.message === 'La carrera ya existe') {
      showAlert('La carrera ya existe', 'error');
    } else {
      showAlert('Error al agregar carrera', 'error');
    }
  }
}

function getCareerByName() {
  const name = document.getElementById('careerSearch').value.trim();
  if (!name) return showAlert('Ingrese el nombre de la carrera a buscar', 'warning');

  fetch(`${API_CAREERS_URL}/${encodeURIComponent(name)}`, { headers })
    .then(res => {
      if (res.status === 404) {
        document.getElementById('careerSearchResult').textContent = 'Carrera no encontrada';
        return;
      }
      if (!res.ok) throw new Error('Error al buscar carrera');
      return res.json();
    })
    .then(career => {
      document.getElementById('careerSearchResult').textContent = `Nombre: ${career.name}`;
    })
    .catch(error => {
      showAlert(error.message, 'error');
    });
}
window.getCareerByName = getCareerByName;
// Elimina una carrera por ID
async function deleteCareer() {
  const id = document.getElementById('careerDelete').value.trim();
  if (!id || isNaN(id)) {
    return showAlert('Ingrese un ID numérico de la carrera a eliminar', 'warning');
  }

  try {
    const res = await fetch(`${API_CAREERS_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    if (res.status === 404) {
      document.getElementById('careerDeleteResult').textContent = 'Carrera no encontrada para eliminar';
      return;
    }
    if (!res.ok) throw new Error('Error al eliminar carrera');
    showAlert('Carrera eliminada correctamente', 'success');
    document.getElementById('careerDelete').value = '';
    loadCareers();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function loadCareersSelect() {
  const res = await fetch(API_CAREERS_URL, { headers });
  const careers = await res.json();
  const select = document.getElementById('registerCareer');
  select.innerHTML = careers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

// ESTUDIANTES

async function loadStudents() {
  const res = await fetch(API_STUDENTS_URL, { headers });
  if (!res.ok) {
    alert('No se pudo cargar alumnos');
    return;
  }
  const students = await res.json();
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.career}</td>`;
    tbody.appendChild(tr);
  });
}

function deleteStudent() {
  const id = document.getElementById('studentDelete').value.trim();
  const resultDiv = document.getElementById('studentDeleteResult');
  if (!id) {
    Swal.fire({
      icon: 'warning',
      title: 'Ingrese el ID del alumno a eliminar',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  // Primero, busca el alumno por ID
  fetch(`${API_STUDENTS_URL}/${encodeURIComponent(id)}`, { headers })
    .then(res => {
      if (res.status === 404) {
        resultDiv.textContent = 'Alumno no encontrado para eliminar';
        throw new Error('Alumno no encontrado');
      }
      if (!res.ok) throw new Error('Error al buscar alumno');
      return res.json();
    })
    .then(alumno => {
      // Muestra confirmación con los datos del alumno
      return Swal.fire({
        icon: 'warning',
        title: '¿Está seguro de eliminar este alumno?',
        html: `<b>ID:</b> ${alumno.id}<br><b>Nombre:</b> ${alumno.name}<br><b>Carrera:</b> ${alumno.career}`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          // Si confirma, elimina el alumno
          return fetch(`${API_STUDENTS_URL}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers,
          });
        } else {
          throw new Error('Eliminación cancelada');
        }
      });
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al eliminar alumno');
      document.getElementById('studentDelete').value = '';
      loadStudents();
      Swal.fire({
        icon: 'success',
        title: 'Alumno eliminado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    })
    .catch(err => {
      if (err.message !== 'Eliminación cancelada') {
        Swal.fire({
          icon: 'error',
          title: err.message,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
}
window.deleteStudent = deleteStudent;
// Registra un nuevo estudiante
function registerStudent() {
  const name = document.getElementById('registerName').value.trim();
  const career = document.getElementById('registerCareer').value;
  if (!name || !career) {
    Swal.fire({
      icon: 'warning',
      title: 'Complete todos los campos',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }
  
  fetch(API_STUDENTS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, career }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al agregar alumno');
      return res.json();
    })
    .then(() => {
      document.getElementById('registerName').value = '';
      Swal.fire({
        icon: 'success',
        title: 'Alumno agregado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      loadStudents();
    })
    .catch(err => {
      Swal.fire({
        icon: 'error',
        title: err.message,
        timer: 2000,
        showConfirmButton: false
      });
    });
}
window.registerStudent = registerStudent;
// Busca un alumno por nombre o ID
function searchStudent() {
  const value = document.getElementById('studentSearch').value.trim();
  const resultDiv = document.getElementById('studentSearchResult');
  if (!value) {
    Swal.fire({
      icon: 'warning',
      title: 'Ingrese un nombre o ID para buscar.',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }
  fetch(`${API_STUDENTS_URL}/${encodeURIComponent(value)}`, { headers })
    .then(res => {
      if (res.status === 404) {
        resultDiv.textContent = 'Alumno no encontrado.';
        return null;
      }
      if (!res.ok) throw new Error('Error al buscar alumno');
      return res.json();
    })
    .then(student => {
      if (student)
        resultDiv.textContent = `ID: ${student.id} | Nombre: ${student.name} | Carrera: ${student.career}`;
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: error.message,
        timer: 2000,
        showConfirmButton: false
      });
    });
}
window.searchStudent = searchStudent;
// Evento para cargar datos al iniciar

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('careersTable')) loadCareers();
  if (document.getElementById('studentsTable')) loadStudents();
  if (document.getElementById('categoriesTable')) loadCategories();
  if (document.getElementById('registerCareer')) loadCareersSelect();
  if (document.getElementById('studentsTable')) loadStudents();

  // Resalta el enlace activo en el nav
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (window.location.pathname.endsWith(link.getAttribute('href'))) {
      link.style.fontWeight = 'bold';
      link.style.textDecoration = 'underline';
      link.style.color = '#009fe3';
    }
  });
});

// Redirecciona a la página de bienvenida al hacer clic en el logo
document.querySelector('header a').addEventListener('click', function(e) {
  e.preventDefault();
  window.location.href = 'bienvenida.html';
});
async function loadCategoriesForCareers() {
  const select = document.getElementById('careerCategory');
  if (!select) return;
  select.innerHTML = '<option value="">Seleccioná una categoría</option>';
  try {
    const res = await fetch(API_CATEGORIES_URL, { headers });
    const categorias = await res.json();
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (e) {
    // Manejo de error opcional
  }
}

// Llama a esta función cuando cargue la página de carreras
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('careerCategory')) loadCategoriesForCareers();
  // ...otras inicializaciones...
});

// =======================
// FLUJO DEL CÓDIGO - EXPLICACIÓN GENERAL
// =======================
//
// Este archivo controla toda la lógica de interacción del sitio web con la API
// para gestionar alumnos, carreras y categorías.
//
// 1. CONFIGURACIÓN INICIAL:
// Se definen las URLs de la API, una clave de autenticación (API_KEY) y los headers
// comunes que se enviarán con cada petición HTTP.
//
// 2. AL CARGAR LA PÁGINA:
// Con el evento DOMContentLoaded se detecta qué secciones están visibles
// y se llaman funciones como:
// - loadCareers() → carga las carreras en una tabla
// - loadStudents() → carga los alumnos en su tabla
// - loadCategories() → carga las categorías disponibles
// - loadCareersSelect() → llena el select para elegir carrera al registrar estudiante
//
// 3. FUNCIONES PARA CATEGORÍAS:
// - loadCategories(): hace GET a la API y muestra los resultados en una tabla.
// - registerCategory(): toma datos del formulario y hace POST a la API.
// - getCategoryByName(): busca una categoría específica por nombre.
// - deleteCategory(): elimina una categoría existente por su nombre.
//
// 4. FUNCIONES PARA CARRERAS:
// - loadCareers(): carga la lista completa de carreras.
// - registerCareer(): registra una nueva carrera con POST.
// - getCareerByName(): busca una carrera por nombre.
// - deleteCareer(): elimina una carrera por su ID.
// - loadCareersSelect(): actualiza el select con las carreras disponibles.
//
// 5. FUNCIONES PARA ESTUDIANTES:
// - loadStudents(): muestra todos los alumnos en una tabla.
// - registerStudent(): agrega un alumno nuevo con nombre y carrera.
// - deleteStudent(): busca un alumno por ID, pide confirmación y lo elimina.
// - searchStudent(): busca un alumno por ID o nombre y muestra los datos.
//
// 6. INTERFAZ Y USABILIDAD:
// - Se usan alertas de SweetAlert para mostrar errores, éxitos y confirmaciones.
// - La navegación se actualiza visualmente para resaltar el enlace activo.
// - El logo redirige a la página de bienvenida.
//
// EN RESUMEN:
// Todo el flujo del código está pensado para que el usuario pueda interactuar
// de forma dinámica con la base de datos (API) sin recargar la página.
// Cada función se encarga de una acción: cargar datos, registrar, buscar o eliminar.
//  El sistema mantiene actualizada la interfaz de acuerdo a las acciones del usuario.
//
