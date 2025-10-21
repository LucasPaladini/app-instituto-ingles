from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Permite conexiones desde tu frontend

# 🔹 Conexión con MongoDB local (Compass)
client = MongoClient("mongodb://localhost:27017/")
db = client["instituto"]
alumnos = db["alumnos"]

# 🔹 Obtener alumnos (todos o filtrados por curso)
@app.route("/alumnos", methods=["GET"])
def obtener_alumnos():
    curso = request.args.get("curso")  # /alumnos?curso=Kinder
    filtro = {"curso": curso} if curso else {}
    lista = list(alumnos.find(filtro, {"_id": 0}))  # Excluye _id
    return jsonify(lista)

# 🔹 Agregar alumno
@app.route("/alumnos", methods=["POST"])
def agregar_alumno():
    data = request.json
    if not data.get("nombre") or not data.get("curso"):
        return jsonify({"error": "Faltan datos"}), 400
    alumnos.insert_one(data)
    return jsonify({"mensaje": "Alumno agregado correctamente"})

# 🔹 Iniciar servidor
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
