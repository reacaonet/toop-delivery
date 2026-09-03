import { Router } from 'express';
import accessoriesController from '../controllers/accessories.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/* Category */
router.get('/category/by-company', authenticate, accessoriesController.categoryByCompany);
router.get('/category/list-by-name', authenticate, accessoriesController.categoryListByName);
router.post('/category', authenticate, accessoriesController.categoryCreate);
router.put('/category', authenticate, accessoriesController.categoryUpdate);
router.delete('/category/:id', authenticate, accessoriesController.categoryRemove);

/* Product */
router.get('/product/list-group', authenticate, accessoriesController.productListGroup);
router.get('/product', authenticate, accessoriesController.productList);
router.get('/product/:id', authenticate, accessoriesController.productGet);
router.post('/product', authenticate, accessoriesController.productCreate);
router.put('/product/sort', authenticate, accessoriesController.productSort);
router.put('/product/:id', authenticate, accessoriesController.productUpdate);
router.delete('/product/:id', authenticate, accessoriesController.productRemove);

/* Product Complement */
router.get('/product-complement/:productId', authenticate, accessoriesController.complementList);
router.post('/product-complement', authenticate, accessoriesController.complementCreate);

/* Complement Item */
router.get('/product-complement-item', authenticate, accessoriesController.itemList);
router.post('/product-complement-item', authenticate, accessoriesController.itemCreate);
router.put('/product-complement-item/:id', authenticate, accessoriesController.itemUpdate);
router.delete('/product-complement-item/:id', authenticate, accessoriesController.itemRemove);

export default router;
