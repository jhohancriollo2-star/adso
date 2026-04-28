import { supabase } from "../backend/db/db.js";
//obtener todos los usuarios 
export const  UserModel ={
    obtenerTodos: async () =>{
        const{ data, error} = await supabase
        .from("usuariio")
        .select("*")
        return{data, error};
    }
};

//crear el usuario
export const crearUsuario =async (nombre, apellido, telefono,rol)=>{
    const{data, error} =await supabase
    .from ('usuario')
    .insert([{nombre,apellido,telefono,rol}])
    .select();
    return {data, error};
}