const ProductRepository = require("../repositorys/product.repository");
const productRepository = new ProductRepository();

class ProductController {

    async addProduct(req, res) {
        const newProduct = req.body;
        try {
            const result = await productRepository.addProduct(newProduct);
            res.status(201).json(result); 
        } catch (error) {
            console.error("Error al agregar un nuevo producto:", error);
            res.status(500).json({ error: "Error interno del servidor al agregar un nuevo producto" }); 
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            const products = await productRepository.getProducts(limit, page, sort, query);
            res.json(products);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
            res.status(500).json({ error: "Error interno del servidor al obtener los productos" });
        }
    }

    async getProductsById(req, res) {
        const id = req.params.pid;
        try {
            const sought = await productRepository.getProductsById(id);
            if (!sought) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            res.json(sought);
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error);
            res.status(500).json({ error: "Error interno del servidor al obtener el producto por ID" }); 
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const updatedProduct = req.body;

            const result = await productRepository.updateProduct(id, updatedProduct);
            res.json(result);
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            res.status(500).json({ error: "Error interno del servidor al actualizar el producto" }); 
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid;
        try {
            let answer = await productRepository.deleteProduct(id);
            res.json(answer);
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            res.status(500).json({ error: "Error interno del servidor al eliminar el producto" }); 
        }
    }
}

module.exports = ProductController;
