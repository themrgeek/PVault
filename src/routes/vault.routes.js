import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createVaultItem,
  listVaultItems,
  getVaultItem,
  updateVaultItem,
  deleteVaultItem,
} from '../controllers/vault.controller.js';

const router = Router();

// Every route in this file requires a valid JWT
router.use(authenticate);

router.post('/', createVaultItem);
router.get('/', listVaultItems);
router.get('/:itemId', getVaultItem);
router.patch('/:itemId', updateVaultItem);
router.delete('/:itemId', deleteVaultItem);

export default router;