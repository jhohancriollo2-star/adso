import express, { json } from 'express';

const app = express();
import dotenv from "dotenv";
import { conectarDB, supabase } from './db/db.js';
dotenv.config();

app.use(express.json());
conectarDB();

app.get ('/',(req,res)=>{
    res.send({
        mensaje:"bienvenido a mi Api REST con Express"
    });
}
);

app.get("/saludo", (req, res)=>{
 res.send({
    mensaje:"hola,bebe esta dentro de mi ruta" ,
    hora:new Date() .toLocaleTimeString()
 });
});

app.get("/personal", (req, res)=>{
 res.send({
    mensaje:"hola mi  nombre es stiven esta es mi ruta " ,
    hora:new Date() .toLocaleTimeString()
 });
});

app.get("/usuario", async (req,res) =>{
    const{data, error} = await supabase
    .from("usuario")
    .select("*");

    if (error){
        console.error("error:", error);
        return res.status(500).json({error});
    }

    console.log ("usuarios obtenidos:",data);
    res.json({
        total:data.length,
        usuarios: data
    });
    
});


//ruta de crear usuarios a la base de datos 
app.post("/usuarios=id", async(req,res)=>{
    //tomamos  los datos como esta en la base de datos 
    const{nombre, apellido,  telefono,rol}= req.body;
    //validamos quelos datos que no esten vacios 
    if (!nombre|| !apellido|| !telefono||!rol){
        console.log ("😜faltan tus datos");
        return res. status(400),json({error:"faltan datos"});
    }
    //insertamos los datos a la base de datos 
    const{data,error}=await supabase
    .from("usuario")
    .insert([{nombre,apellido,telefono,rol}])
    .select();

    //validamos si hay error
    if(error){
        console.error("error:",error)
        return res.status (500).json({error});
    }
    // respuesta al cliente 
    res.json ({
        mensaje:"✅ usuario de cliente creado exitoamnete",
        usuario:data[o]
    });

})

//ruta de actiualizar usuario a la base de datos //

        app.put("/usuario/:id", async (req,res)=>{
            console.log ("💬BODY UPDATE:", req.body);

            const { id } = req.params;
            const { nombre, apellido, telefono,  rol, } = req.body;


//validar id//

            if (!id){
                return res.status(400).json({ error: "⚠ Falta el Id"});
            }

            // validar que llegue al menos un dato//

            if (!nombre || !apellido || !telefono || !rol ){
                return res.status(400).json({ error: "no hay datos para actualizar" });
            }
            // construir un objeto dinamico//

            const datosActualizar = {};
            if (nombre) datosActualizar.nombre = nombre;
            if (apellido) datosActualizar.apellido = apellido;
            if (telefono) datosActualizar.telefono = telefono;
            if (rol) datosActualizar.rol = rol;
           
            console.log ("💬Datos a actualizar:", datosActualizar);


            //actualizar en supabase//

            const { data, error } = await supabase
            .from("usuario")
            .update(datosActualizar)
            .eq("id", id)
            .select();

            console.log("💥BD", data);
            console.log("⚠ Error", error);

            if (error){
                return res.status(500).json({ error });
             }
             
             if (!data || data.length === 0){
                return res.status(404).json({ error: "Usuario no encontrado" });
                }
                res.json ({
                    mensaje:"✅usuario actualizado",
                    usuario:data[0]
                });

               // Ruta de eliminar usuario de la base de datos
// 1. Se agregó el slash inicial "/"
app.delete("/usuarios/:id", async (req, res) => {

    const { id } = req.params;
    console.log("🗑️ ID a eliminar:", id);

    // Validar id 
    if (!id) {
        return res.status(400).json({ error: "Falta id" });
    }

    // eliminar supabase
    const { data, error } = await supabase
        .from("usuarios") // 2. Corregido de "usaurios" a "usuarios"
        .delete()
        .eq("id", id)
        .select();

    console.log("🔔 DB:", data);
    console.log("☣️ ERROR:", error);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" }); 
    }

    res.json({
        mensaje: "🎆 Usuario eliminado correctamente", 
        usuario: data[0]
    });
});

} );


// Ruta POST para crear pedidos
app.post('/api/pedidos', async (req, res) => {
    // 1. Extraer los datos con los nombres exactos de tu tabla
    const { id_usuario, cantidad, descripcion, total } = req.body;

    // 2. Validar (Cambiado a id_usuario para que coincida)
    if (!descripcion || !cantidad || !total || !id_usuario) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        // 3. Guardar en Supabase usando los nombres de tu imagen
        const { data, error } = await supabase
            .from('pedidos')
            .insert([
                { 
                    id_usuario,   // Nombre exacto en la tabla
                    cantidad, 
                    descripcion, 
                    total 
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            mensaje: "Pedido creado con éxito",
            pedido: data[0]
        });

    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta GET para buscar pedidos de un usuario específico con JOIN
app.get('/api/pedidos/:id_usuario', async (req, res) => {
    // 1. Extraer el parámetro de la URL
    const { id_usuario } = req.params;

    try {
        // 2. Buscar en Supabase con JOIN
        // El formato '*, usuarios(*)' trae todos los pedidos y los datos del usuario relacionado
        const { data, error } = await supabase
            .from('pedidos')
            .select(`*, usuario!id_usuario(nombre)`)
            .eq('id_usuario', id_usuario);

        // 3. Manejar errores
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // 4. Retornar los datos (Array de pedidos con info del usuario)
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta PUT para actualizar un pedido existente
app.put('/api/pedidos/:id', async (req, res) => {
    // 1. Extraer el ID del pedido desde los parámetros de la URL
    const { id } = req.params;

    // 2. Extraer los datos a actualizar desde el cuerpo de la solicitud
    const { descripcion, cantidad, total } = req.body;

    try {
        // 3. Actualizar en Supabase
        const { data, error } = await supabase
            .from('pedidos')
            .update({ 
                descripcion, 
                cantidad, 
                total 
            })
            .eq('id', id) // Filtra para actualizar solo el pedido con ese ID
            .select();

        // 4. Manejar posibles errores
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // 5. Verificar si el pedido existía
        if (data.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        // 6. Retornar el pedido actualizado
        res.status(200).json({
            mensaje: "Pedido actualizado con éxito",
            pedido: data[0]
        });

    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



const PORT=3000;
app.listen(PORT,()=>{
console.log(`Servidor corriendo en el puerto: ${PORT}`);
console.log(`http://localhost:${PORT}`);
});