from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime


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

print("debugeo")
print("debugeo")


db = client[dbname]
alumnos = db["alumnos"]
cursos = db["cursos"]
historial = db["historial"]





def guardar_historial(entidad, entidad_id, accion, usuario=None, antes=None, despues=None):
    historial.insert_one({
        "entidad": entidad,          # "curso"
        "entidadId": entidad_id,     # nombre del curso
        "accion": accion,            # crear / modificar / eliminar
        "usuario": usuario or "admin",
        "fecha": datetime.utcnow(),
        "cambios": {
            "antes": antes or None,
            "despues": despues or None
        }
    })





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



# Alumnos

@app.route("/alumnos", methods=["GET"])
def obtener_alumnos():
    curso = request.args.get("curso")
    filtro = {"curso": curso} if curso else {}
    return jsonify(list(alumnos.find(filtro, {"_id": 0})))

@app.route("/alumnos", methods=["POST"])
def agregar_alumno():
    data = request.json
    if not data.get("nombre") or not data.get("apellido") or not data.get("curso") or not data.get("dni"):
        return jsonify({"error": "Faltan datos"}), 400
    try:
        alumnos.insert_one(data)
        guardar_historial("alumno", data["dni"], "crear", usuario=data.get("usuario"), despues=data)
        return jsonify({"mensaje": "Alumno agregado correctamente"})
    except DuplicateKeyError:
        return jsonify({"error": "El DNI ya existe"}), 400

@app.route("/alumnos/<dni>", methods=["PUT"])
def modificar_alumno(dni):
    nuevos_datos = request.get_json()
    nuevos_datos.pop("dni", None)
    antes = alumnos.find_one({"dni": dni}, {"_id": 0})
    res = alumnos.update_one({"dni": dni}, {"$set": nuevos_datos})
    if res.matched_count:
        guardar_historial("alumno", dni, "modificar", usuario=nuevos_datos.get("usuario"), antes=antes, despues=nuevos_datos)
        return jsonify({"mensaje": "Alumno modificado correctamente"})
    return jsonify({"error": "Alumno no encontrado"}), 404

@app.route("/alumnos/<dni>", methods=["DELETE"])
def eliminar_alumno(dni):
    antes = alumnos.find_one({"dni": dni}, {"_id": 0})
    res = alumnos.delete_one({"dni": dni})
    if res.deleted_count:
        guardar_historial("alumno", dni, "eliminar", antes=antes)
        return jsonify({"mensaje": "Alumno eliminado"})
    return jsonify({"error": "Alumno no encontrado"}), 404


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




# Alumnos


@app.route("/alumnos/<dni>/notas", methods=["PUT"])
def actualizar_notas(dni):
    data = request.get_json()
    notas = data.get("notas")
    if notas is None:
        return jsonify({"error": "Faltan notas"}), 400
    antes = alumnos.find_one({"dni": dni}, {"_id": 0})
    alumnos.update_one({"dni": dni}, {"$set": {"notas": notas}})
    guardar_historial("libreta", dni, "modificar", despues={"notas": notas}, antes=antes, usuario=data.get("usuario"))
    return jsonify({"mensaje": "Notas actualizadas correctamente"})


# Cursitos


# GET todos los cursos
@app.route("/cursos", methods=["GET"])
def get_cursos():
    return jsonify(list(cursos.find({}, {"_id": 0})))

@app.route("/cursos", methods=["POST"])
def post_curso():
    nombre = request.json.get("nombre")
    usuario = request.json.get("usuario")
    if not nombre or cursos.find_one({"nombre": nombre}):
        return jsonify({"error": "Nombre inválido o ya existe"}), 400
    cursos.insert_one({"nombre": nombre})
    guardar_historial(
        entidad="curso",
        entidad_id=nombre,
        accion="crear",
        usuario=usuario,
        despues={"nombre": nombre}
    )
    return jsonify({"mensaje": "Curso creado"})

@app.route("/cursos/<nombre>", methods=["PUT"])
def put_curso(nombre):
    nuevo = request.json.get("nombre")
    usuario = request.json.get("usuario")
    if not nuevo or cursos.find_one({"nombre": nuevo}):
        return jsonify({"error": "Nombre inválido o ya existe"}), 400
    antes = cursos.find_one({"nombre": nombre}, {"_id": 0})
    res = cursos.update_one({"nombre": nombre}, {"$set": {"nombre": nuevo}})
    if res.matched_count:
        guardar_historial("curso", nombre, "modificar", usuario=usuario, antes=antes, despues={"nombre": nuevo})
        return jsonify({"mensaje": "Curso modificado"})
    return jsonify({"error": "Curso no encontrado"}), 404

@app.route("/cursos/<nombre>", methods=["DELETE"])
def delete_curso(nombre):
    usuario = request.args.get("usuario")
    antes = cursos.find_one({"nombre": nombre}, {"_id": 0})
    res = cursos.delete_one({"nombre": nombre})
    if res.deleted_count:
        guardar_historial("curso", nombre, "eliminar", usuario=usuario, antes=antes)
        return jsonify({"mensaje": "Curso eliminado"})
    return jsonify({"error": "Curso no encontrado"}), 404






# Ruta para pagos

@app.route("/pagos", methods=["GET"])
def get_pagos():
    anio = int(request.args.get("anio", datetime.now().year))

    alumnos_list = list(
        alumnos.find(
            {},
            {"_id": 0, "dni": 1, "apellido": 1, "nombre": 1}
        ).sort("apellido", 1)
    )

    pagos_list = list(
        db["pagos"].find(
            {"anio": anio},
            {"_id": 0}
        )
    )

    pagos_por_dni = {p["dni"]: p for p in pagos_list}

    resultado = []

    for a in alumnos_list:
        pago = pagos_por_dni.get(a["dni"])

        if not pago:
            pago = {
                "dni": a["dni"],
                "apellido": a["apellido"],
                "nombre": a["nombre"],
                "anio": anio,
                "meses": {
                    "marzo": False,
                    "abril": False,
                    "mayo": False,
                    "junio": False,
                    "julio": False,
                    "agosto": False,
                    "septiembre": False,
                    "octubre": False,
                    "noviembre": False,
                    "diciembre": False
                }
            }

        resultado.append(pago)

    return jsonify(resultado)



@app.route("/pagos/<dni>", methods=["PUT"])
def actualizar_pago(dni):
    data = request.json
    mes = data.get("mes")
    valor = data.get("valor")
    anio = int(data.get("anio"))

    if mes is None or valor is None:
        return jsonify({"error": "Datos incompletos"}), 400

    alumno = alumnos.find_one(
        {"dni": dni},
        {"_id": 0, "apellido": 1, "nombre": 1}
    )

    if not alumno:
        return jsonify({"error": "Alumno no encontrado"}), 404

    db["pagos"].update_one(
        {"dni": dni, "anio": anio},
        {
            "$setOnInsert": {
                "dni": dni,
                "anio": anio,
                "apellido": alumno["apellido"],
                "nombre": alumno["nombre"]
            },
            "$set": {
                f"meses.{mes}": valor
            }
        },
        upsert=True
    )

    return jsonify({"mensaje": "Pago actualizado"})













# RUTA HISTORIAL

@app.route("/historial", methods=["GET"])
def get_historial():
    docs = list(
        historial.find(
            {},
            {
                "_id": 0,
                "cambios.antes._id": 0,
                "cambios.despues._id": 0
            }
        ).sort("fecha", -1)
    )
    return jsonify(docs)






if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)