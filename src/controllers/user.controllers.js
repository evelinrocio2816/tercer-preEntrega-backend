const UserModel = require("../models/user.models.js");
const CartModel = require("../models/cart.models.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashBcryp.js");
const UserDTO = require("../dto/user.dto.js");
const GithubUserModel = require("../models/githubUser.models.js")
class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const existUser = await UserModel.findOne({ email });
            if (existUser) {
                return res.status(400).send("El usuario ya existe");
            }

            //Creo un nuevo carrito: 
            const newCart = new CartModel();
            await newCart.save();

            const newUser = new UserModel({
                first_name,
                last_name,
                email,
                cart: newCart._id, 
                password: createHash(password),
                age
            });

            await newUser.save();

            const token = jwt.sign({ user: newUser }, "coderhouse", {
                expiresIn: "1h"
            });

            res.cookie("CookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/user/profile");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const userFound = await UserModel.findOne({ email });

            if (!userFound) {
                return res.status(401).send("Usuario no válido");
            }

            const isValid = isValidPassword(password, userFound);
            if (!isValid) {
                return res.status(401).send("Contraseña incorrecta");
            }

            const token = jwt.sign({ user: userFound }, "coderhouse", {
                expiresIn: "1h"
            });

            res.cookie("CookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/user/profile");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async profile(req, res) {
        //Con DTO: 
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
        const isAdmin = req.user.role === 'admin';
        res.render("profile", { user: userDto, isAdmin });
    }

    async logout(req, res) {
        res.clearCookie("CookieToken");
        res.redirect("/login");
    }

    async admin(req, res) {
        if (req.user.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.render("admin");
    }


///VERSION PARA GITHUB: 
async githubAuthCallback(req, res) {
    
    try {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/products"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}
}
module.exports = UserController;
