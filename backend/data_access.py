from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Permite conexiones desde tu frontend

# 🔹 Conexión con MongoDB local (Compass)
client = MongoClient("mongodb://localhost:27017/")
db = client["instituto"]
alumnos = db["alumnos"]


@app.route("/alumnos", methods=["GET"])
def obtener_alumnos():
    curso = request.args.get("curso")
    filtro = {"curso": curso} if curso else {}
    lista = list(alumnos.find(filtro, {"_id": 0}))
    return jsonify(lista)


@app.route("/alumnos", methods=["POST"])
def agregar_alumno():
    data = request.json
    if not data.get("nombre") or not data.get("apellido") or not data.get("curso"):
        return jsonify({"error": "Faltan datos"}), 400
    alumnos.insert_one(data)
    return jsonify({"mensaje": "Alumno agregado correctamente"})


@app.route('/alumnos/<dni>', methods=['DELETE'])
def eliminar_alumno(dni):
    from flask import jsonify

    resultado = alumnos.delete_one({"dni": dni})
    if resultado.deleted_count == 0:
        return jsonify({"error": "Alumno no encontrado"}), 404
    return jsonify({"mensaje": f"Alumno {dni} eliminado correctamente"}), 200


@app.route("/alumnos/<dni>", methods=["PUT"])
def modificar_alumno(dni):
    nuevos_datos = request.get_json()
    nuevos_datos.pop("dni", None)  # No se cambia el DNI
    resultado = alumnos.update_one({"dni": dni}, {"$set": nuevos_datos})
    if resultado.matched_count == 0:
        return jsonify({"error": "Alumno no encontrado"}), 404
    return jsonify({"mensaje": f"Alumno {dni} modificado correctamente"}), 200


@app.route("/alumnos/<dni>/notas", methods=["PUT"])
def agregar_o_editar_notas(dni):
    nueva_nota = request.get_json()
    alumno = alumnos.find_one({"dni": dni})
    if not alumno:
        return jsonify({"error": "Alumno no encontrado"}), 404

    notas = alumno.get("notas", [])

    # Ver si ya hay notas para ese año
    año_existente = next((n for n in notas if n["anio"] == nueva_nota["anio"]), None)
    if año_existente:
        # Actualizar curso y trimestres
        año_existente["curso"] = nueva_nota.get("curso", año_existente.get("curso"))
        año_existente["trimestres"].update(nueva_nota.get("trimestres", {}))
    else:
        notas.append(nueva_nota)

    alumnos.update_one({"dni": dni}, {"$set": {"notas": notas}})
    return jsonify({"mensaje": "Notas agregadas o editadas correctamente"})



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
