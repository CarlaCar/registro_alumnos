class Estudiante {
    constructor(nombre, edad, curso) {
        this._nombre = nombre;
        this._edad = edad;
        this._curso = curso;
    }

    inscribir() {
        console.log(`${this._nombre}, ha sido inscrito en el curso: ${this._curso}`);
    }

    get edad() {
        return this._edad;
    }

    set edad(nuevaEdad) {
        if (nuevaEdad < 0) {
            console.error("La edad no puede ser negativa.");
        } else {
            this._edad = nuevaEdad;
        }
    }

    get curso() {
        return this._curso;
    }

    set curso(nuevoCurso) {
        if (nuevoCurso.trim() === "") {
            console.error("El curso no puede estar vacío.");
        } else {
            this._curso = nuevoCurso;
        }
    }
}

const estudiante = new Estudiante("Juan", 20, "ia");