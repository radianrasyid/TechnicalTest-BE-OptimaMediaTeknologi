const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { User, Account } = require("../models")


module.exports = {
    encryptPassword(password){
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, encryptedPassword) => {
                if(err){
                    reject(err)
                    return;
                }

                resolve(encryptedPassword)
            })
        })
    },

    comparePassword(encryptedPassword, password){
        return new Promise((reject, resolve) => {
            bcrypt.compareSync(
                password,
                encryptedPassword,
                (err, isPasswordCorrect)=> {
                    if(err){
                        reject(err)
                        return;
                    }

                    resolve(isPasswordCorrect)
                }
            )
        })
    },

    async createToken(payload){
        return jwt.sign(payload, "Rahasia")
    },

    async validate(requestBody, res){
        try {
            const email = requestBody.body.email.toLowerCase();
            const pass = requestBody.body.password;

            const user = await User.findOne({
                where: {email},
            })

            if(!user){
                res.status(400).json({
                    message: "Can't find that account"
                })
            }

            const isPasswordCorrect = await this.comparePassword(
                user[0].dataValues.password,
                pass
            );

            if(!isPasswordCorrect){
                res.status(400).json({
                    message: "Can't find that account"
                })
            }

            const token = this.createToken({
                id: user[0].dataValues.id,
                nama_lengkap: user[0].dataValues.nama_lengkap,
                gender: user[0].datavalues.gender,
                goldar: user[0].dataValues.goldar,
                photo: user[0].dataValues.photo,
            });

            const newToken = {
                nama: user[0].dataValues.nama_lengkap,
                id: user[0].dataValues.id,
                token
            }

            return newToken;
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "Something Went Wrong"
            })
        }
    },

    async authorizeUser(req, res, next){
        try {
            const bearerToken = req.headers.authorization;
            const token = bearerToken.split("Bearer ")[1];
            const tokenPayload = jwt.verify(
                token,
                "Rahasia"
            );

            const id = tokenPayload.id;
            const requestUser = await Account.findAll({
                where: {
                    id: id
                },
                include: ["userRoles", "userid"]
            })
            if(requestUser){
                req.result = {
                    user: {
                        name: requestUser.nama_lengkap,
                        NIK: requestUser.nik
                    }
                };

                req.tokenPayload = tokenPayload;
                next();
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: "Unauthorized"
            })
        }
    },

    async authorizeAdmin(req, res, next){
        try {
            const bearerToken = req.headers.authorization;
            const token = bearerToken.split("Bearer ")[1];
            const tokenPayload = jwt.verify(
                token,
                "Rahasia"
            );

            const id = tokenPayload.id;
            const requestUser = await Account.findAll({
                where: {
                    id: id
                },
                include: ["userRoles", "userid"]
            })
            console.log(requestUser);
            if(requestUser[0].dataValues.userRoles.id == 1){
                req.result = {
                    user: {
                        name: requestUser[0].dataValues.nama_lengkap,
                        NIK: requestUser[0].dataValues.nik
                    }
                };

                req.tokenPayload = tokenPayload;
                next();
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: "Unauthorized"
            })
        }
    }
}