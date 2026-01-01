import express from 'express';

import {getOrders,addOrder,cancelOrder,updateOrderStatus,getOrderById,getOrdersByUser} from '../controllers/order.js';

const router = express.Router();
router.get('/', getOrders);
router.post('/', addOrder);
router.put('/cancel/:id', cancelOrder);
router.put('/status/:id', updateOrderStatus);
router.get('/:id', getOrderById);
router.get('/user/:userId', getOrdersByUser);

export default router;
