//----Importamos dotenv para poder acceder a mis variables de entorno ocultas
const dotenv = require("dotenv");
//----Configuramos dotenv
dotenv.config();

const mongoose = require("mongoose");

// Recuperamos la URI de Mongo de nuestro archivo .env
const mongoDB = process.env.MONGO_URI;

//----Creamos la función asíncrona que conectará nuestro servidor con la base de datos
const connect = async () => {
  try {
    // Verificación de seguridad
    if (!mongoDB) {
      throw new Error("La variable MONGO_URI no está definida en el archivo .env");
    }

    console.log("Intentando conectar a MongoDB Atlas...");

    // Intentamos la conexión con el parche de familia IPv4
    const db = await mongoose.connect(mongoDB, {
      family: 4, // Fuerza el uso de IPv4 (Soluciona el error de Whitelist en Windows)
    });

    // Sacamos el nombre de la base de datos y el host
    const { name, host } = db.connection;
    console.log(`✅ ¡ÉXITO! Conectado a la base de datos: ${name} en el host: ${host}`);

  } catch (error) {
    console.error("❌ Error de conexión detallado:");
    console.error(error.message);
    
    // Si el error persiste, damos un consejo específico
    if (error.message.includes("MongooseServerSelectionError")) {
      console.log("\n💡 TIP: Revisa si tu antivirus o Firewall está bloqueando a Node.js.");
    }
  }
};

//----Exportamos la función
module.exports = { connect };