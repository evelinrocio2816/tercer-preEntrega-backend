
const mongoose = require("mongoose");



 mongoose.connect("mongodb+srv://evelinrocio2816:Airbag2816@cluster0.sasvmwp.mongodb.net/TiendaDeRopas?retryWrites=true&w=majority&appName=Cluster0")
.then(()=> console.log("Conexion Exitosa"))
.catch((error)=>console.log("Error de conexion", error))