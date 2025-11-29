from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

app = Flask(__name__)
CORS(app)  # Permite conexiones desde tu frontend

# # 🔹 Conexión con MongoDB local (Compass)
# client = MongoClient("mongodb://localhost:27017/")
# db = client["instituto"]
# alumnos = db["alumnos"]


# 🔹 Conexión con MongoDB atlas (Atlas)
dbname = "instituto"
uri = f"mongodb+srv://lucaspaladini_db_user:12345@pclucas0.ignfs1p.mongodb.net/"
client = MongoClient(uri)

db = client[dbname]
alumnos = db["alumnos"]

print("debugeo")
print("debugeo")

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    dni = data.get("dni")
    password = data.get("password")

    if not dni or not password:
        return jsonify({"error": "Faltan datos"})

    admin = db["administradores"].find_one({"dni": dni, "password": password})
    if admin:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})


@app.route("/alumnos", methods=["GET"])
def obtener_alumnos():
    curso = request.args.get("curso")
    filtro = {"curso": curso} if curso else {}
    lista = list(alumnos.find(filtro, {"_id": 0}))
    return jsonify(lista)

@app.route("/alumnos", methods=["POST"])
def agregar_alumno():
    data = request.json

    if not data.get("nombre") or not data.get("apellido") or not data.get("curso") or not data.get("dni"):
        return jsonify({"error": "Faltan datos"})

    try:
        alumnos.insert_one(data)
        return jsonify({"mensaje": "Alumno agregado correctamente"})
    except DuplicateKeyError:
        return jsonify({"error": "El DNI ya existe"})

@app.route('/alumnos/<dni>', methods=['DELETE'])
def eliminar_alumno(dni):
    resultado = alumnos.delete_one({"dni": dni})
    if resultado.deleted_count == 0:
        return jsonify({"error": "Alumno no encontrado"})
    return jsonify({"mensaje": f"Alumno {dni} eliminado correctamente"})


@app.route("/alumnos/<dni>", methods=["PUT"])
def modificar_alumno(dni):
    nuevos_datos = request.get_json()
    nuevos_datos.pop("dni", None)  # No se cambia el DNI
    resultado = alumnos.update_one({"dni": dni}, {"$set": nuevos_datos})
    if resultado.matched_count == 0:
        return jsonify({"error": "Alumno no encontrado"})
    return jsonify({"mensaje": f"Alumno {dni} modificado correctamente"})


@app.route("/alumnos/buscar", methods=["GET"])
def buscar_alumno():
    dni = request.args.get("dni")
    if not dni:
        return jsonify({"error": "Falta el parámetro DNI"})

    alumno = alumnos.find_one({"dni": dni}, {"_id": 0})
    if alumno:
        return jsonify([alumno])
    else:
        return jsonify([])


@app.route("/alumnos/<dni>/notas", methods=["PUT"])
def actualizar_notas(dni):
    data = request.get_json()
    notas = data.get("notas")
    if notas is None:
        return jsonify({"error": "Faltan notas"})

    alumno = alumnos.find_one({"dni": dni})
    if not alumno:
        return jsonify({"error": "Alumno no encontrado"})

    alumnos.update_one({"dni": dni}, {"$set": {"notas": notas}})
    return jsonify({"mensaje": "Notas actualizadas correctamente"})


# Cursitos

cursos = db["cursos"]

# GET todos los cursos
@app.route("/cursos", methods=["GET"])
def get_cursos():
    return jsonify(list(cursos.find({}, {"_id": 0})))

# POST crear curso
@app.route("/cursos", methods=["POST"])
def post_curso():
    nombre = request.json.get("nombre")
    if not nombre or cursos.find_one({"nombre": nombre}):
        return jsonify({"error": "Nombre inválido o ya existe"}), 400
    cursos.insert_one({"nombre": nombre})
    return jsonify({"mensaje": "Curso creado"})

# PUT modificar curso
@app.route("/cursos/<nombre>", methods=["PUT"])
def put_curso(nombre):
    nuevo = request.json.get("nombre")
    if not nuevo or cursos.find_one({"nombre": nuevo}):
        return jsonify({"error": "Nombre inválido o ya existe"}), 400
    res = cursos.update_one({"nombre": nombre}, {"$set": {"nombre": nuevo}})
    return jsonify({"mensaje": "Curso modificado"} if res.matched_count else {"error": "No encontrado"}), 200

# DELETE curso
@app.route("/cursos/<nombre>", methods=["DELETE"])
def delete_curso(nombre):
    res = cursos.delete_one({"nombre": nombre})
    return jsonify({"mensaje": "Curso eliminado"} if res.deleted_count else {"error": "No encontrado"}), 200



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
