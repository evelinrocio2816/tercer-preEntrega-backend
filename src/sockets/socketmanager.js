const socket = require("socket.io");
const ProductServices = require("../services/product.services.js");
const productServices = new ProductServices(); 
const MessageModel = require("../models/message.models.js");

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Un cliente se conectó");
            
            socket.emit("products", await productServices.getProducts() );

            socket.on("deleteProduct", async (id) => {
                await productServices.deleteProduct(id);
                this.emitUpdatedProducts(socket);
            });

            socket.on("addproduct", async (product) => {
                await productServices.addProduct(product);
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productServices.getProducts());
    }
}

module.exports = SocketManager;
