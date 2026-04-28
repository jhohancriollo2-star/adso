import {UserModel, crearUser, actualizarUser , eliminarUser} from "../models/user.js";

export const usuario =async (req, res) =>{
    //aqui  recibes lo que el modelo envio con el "return"
    const {data, error} = await UserModel.obtenerTodos();

    console.log ("DATA:", data);
    console.log ("ERROR:", error);

    if (error){
        return res.status (500).json({error});
    }
    return res.status(200).json(data)
}