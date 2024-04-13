const CartRepository = require("../repositorys/cart.repository.js");
const cartRepository = new CartRepository();
const TicketModel = require("../models/ticket.models.js")
const UserModel = require("../models/user.models.js")
const ProductRepository = require("../repositorys/product.repository.js")
const productRepository = new ProductRepository()
const{generateUniqueCode, calculateTotal} = require("../utils/cartUtils.js")

class CartController {
    async newCart(req, res) {
        try {
            const newCart = await cartRepository.createCart();
            res.json(newCart);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async getProductsFromCart(req, res) {
        const cartId = req.params.cid;
        try {
            const products = await cartRepository.getProductsFromCart(cartId);
            if (!products) {
                return res.status(404).json({ error: "Carrito no encontrado" }); 
            }
            res.json(products);
        } catch (error) {
            console.error("Error al obtener productos del carrito:", error);
            res.status(500).json({ error: "Error interno al obtener productos del carrito" });
        }
    }
    

    async addProductToCart(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        try {
            await cartRepository.addProduct(cartId, productId, quantity);
           const cartID = (req,user,cart).toString()

            res.redirect(`/carts/${cartID}`)
    
            res.status(201).json({ message: 'Producto añadido al carrito correctamente' }); 
        } catch (error) {
            console.error("Error al añadir producto al carrito:", error);
            res.status(400).json({ error: "Error al añadir producto al carrito" });
        }
    }
    
    async removeProductFromCart(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        try {
            const updatedCart = await cartRepository.removeProduct(cartId, productId);
            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            res.status(400).json({ error: "Error al eliminar producto del carrito" });
        }
    }

    async updateProductsInCart(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;
        try {
            const updatedCart = await cartRepository.updateProductsInCart(cartId, updatedProducts);
            res.json(updatedCart);
        } catch (error) {
            console.error("Error al actualizar productos del carrito:", error);
            res.status(400).json({ error: "Error al actualizar productos del carrito" }); 
        }
    }

    async updateQuantity(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.updateQuantityInCart(cartId, productId, newQuantity);
            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al actualizar la cantidad de productos en el carrito:", error);
            res.status(400).json({ error: "Error al actualizar la cantidad de productos en el carrito" }); 
        }
    }

    async emptyCart(req, res) {
        const cartId = req.params.cid;
        try {
            const updatedCart = await cartRepository.emptyCart(cartId);
            res.json({
                status: 'success',
                message: 'Todos los productos del carrito fueron eliminados correctamente',
                updatedCart,
            });
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            res.status(500).json({ error: "Error interno del servidor al vaciar el carrito" }); 
        }
    }

     
     async finalizePursache(req, res) {
        const cartId = req.params.cid;
        try {
            const cart = await cartRepository.addProductToCart(cartId);
            const products = cart.products;

            const productsNotAvailable = [];

      
            for (const item of products) {
                const productId = item.product;
                const product = await productRepository.getProductsById(productId);
                if (product.stock >= item.quantity) {
                    
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                  
                    productsNotAvailable.push(productId);
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId });

            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calculateTotal(cart.products),
                purchaser: userWithCart._id
            });
            await ticket.save();

          
            cart.products = cart.products.filter(item => productsNotAvailable.some(productId => productId.equals(item.product)));

           
            await cart.save();
            res.status(201).json({ productsNotAvailable, message: "Compra procesada exitosamente", ticketId: ticket._id });
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = CartController;

