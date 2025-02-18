import express from 'express';
import { updateUserInventory } from '../controllers/inventoryController.js';

const router = express.Router();

router.put('/:did', updateUserInventory);

export default router; 