import { Router } from "express";

import{ usuario} from '../controllers/user.js';

const router =  Router();

router.get('/',usuario);


export default router;