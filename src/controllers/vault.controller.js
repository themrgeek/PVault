import mongoose from 'mongoose';
import { VaultItem } from '../models/VaultItem.js';
import { ApiError } from '../utils/ApiError.js';
import {encrypt, decrypt} from '../utils/crypto.js'
const ALLOWED_SORTS = [
  'createdAt',
  '-createdAt',
  'updatedAt',
  '-updatedAt',
  'siteName',
  '-siteName',
];

// ---------------------------------------------------------------------------
// POST /api/v1/vault-items
// ---------------------------------------------------------------------------
export async function createVaultItem(req, res, next) {
  try {
    const { siteName, siteUrl, username, password, notes } = req.body;

    const item = await VaultItem.create({
      userId: req.userId, // key from JWT — never from the request body
      siteName: String(siteName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape regex special chars to prevent ReDoS
      siteUrl: String(siteUrl).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape regex special chars to prevent ReDoS
      username: String(username).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape regex special chars to prevent ReDoS
      password: encrypt(password), // encrypt before saving
      notes: String(notes).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape regex special chars to prevent ReDoS
    });

    res.status(201).json({
      id: item._id,
      siteName: item.siteName,
      siteUrl: item.siteUrl,
      username: item.username,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    next(error); // which middleware handles and sends a proper error response? 
    // The error handling middleware defined in app.js (or server.js) will catch this and send a proper response. How will next(error) work? It passes the error to the next middleware in the stack, which is typically the error handling middleware. This middleware will then format and send the error response to the client.
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/vault-items
// ---------------------------------------------------------------------------
export async function listVaultItems(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0); 
    // what is limit and offset? 
    // Limit is the maximum number of items to return in a single response, 
    // while offset is the number of items to skip before starting to collect the result set.
    // They are used for pagination, allowing clients to retrieve large datasets in smaller chunks.

    // For example, if you have 100 items and you set limit=20 and offset=40,
    // the server will return items 41 to 60 (20 items starting from the 41st item).
    // This allows clients to request data in manageable portions, improving performance and user experience.
    const sort = ALLOWED_SORTS.includes(req.query.sort)
      ? req.query.sort
      : '-createdAt';

    const filter = { userId: req.userId };

    if (req.query.siteName) {
      // escape regex special chars to prevent ReDoS
      const safe = String(req.query.siteName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.siteName = { $regex: safe, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      VaultItem.find(filter).sort(sort).skip(offset).limit(limit),
      VaultItem.countDocuments(filter),
    ]);

    res.status(200).json({
      data: items.map((item) => ({
        id: item._id,
        siteName: item.siteName,
        siteUrl: item.siteUrl,
        username: item.username,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      pagination: {
        limit,
        offset,
        total,
        next:
          offset + limit < total
            ? `/api/v1/vault-items?limit=${limit}&offset=${offset + limit}`
            : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/vault-items/:itemId
// ---------------------------------------------------------------------------
export async function getVaultItem(req, res, next) {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(404, 'Vault item not found');
    }

    const item = await VaultItem.findOne({
      _id: itemId,
      userId: req.userId, // 🔒 ownership check baked into the query
    }).select('+password'); // explicitly request the password field

    if (!item) {
      throw new ApiError(404, 'Vault item not found');
    }

    res.status(200).json({
      id: item._id,
      siteName: item.siteName,
      siteUrl: item.siteUrl,
      username: item.username,
      password: decrypt(item.password), // 🔓 decrypt for the owner only
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/vault-items/:itemId
// ---------------------------------------------------------------------------
export async function updateVaultItem(req, res, next) {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(404, 'Vault item not found');
    }

    const item = await VaultItem.findOne({
      _id: itemId,
      userId: req.userId,
    });

    if (!item) {
      throw new ApiError(404, 'Vault item not found');
    }

    // Whitelist updatable fields — never trust the client with arbitrary keys
    const allowed = ['siteName', 'siteUrl', 'username', 'notes', 'password'];

    for (const key of Object.keys(req.body)) {
      if (!allowed.includes(key)) continue;

      if (key === 'password') {
        item.password = encrypt(req.body.password);
      } else {
        item[key] = req.body[key];
      }
    }

    await item.save(); // runs validators

    res.status(200).json({
      id: item._id,
      siteName: item.siteName,
      siteUrl: item.siteUrl,
      username: item.username,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/vault-items/:itemId
// ---------------------------------------------------------------------------
export async function deleteVaultItem(req, res, next) {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(404, 'Vault item not found');
    }

    const result = await VaultItem.deleteOne({
      _id: itemId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Vault item not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}