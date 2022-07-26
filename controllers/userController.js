const {
    User,
    Account
} = require("../models")

const authController = require("./authController");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const uploadOnMemory = require("../helpers/uploadOnMemory");
const cloudinary = require("../helpers/cloudinary")

module.exports = {
    async register(req, res) {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (password.length >= 8 && password.length <= 20) {
                const encryptedPassword = await authController.encryptPassword(password);
                const account = await Account.create({
                    email: email,
                    password: encryptedPassword,
                })

                return res.status(201).json({
                    result: account,
                    message: "Successfully created your account!"
                })
            } else {
                return res.status(400).json({
                    message: "password length must be 8-20 characters"
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "something went wrong when creating your account"
            })
        }
    },

    async login(req, res) {
        try {
            const email = req.body.email.toLowerCase();
            const password = req.body.password;

            const user = await Account.findAll({
                where: {
                    email: email
                },
                include: ["userRoles", "userid"]
            })

            console.log(user);

            if (!user) {
                console.log("EMAIL NOT MATCH");
                return res.status(400).json({
                    message: "your email or password might be wrong"
                })
            }

            console.log(user)

            const isPasswordCorrect = bcrypt.compareSync(
                password,
                user[0].dataValues.password
            );
            console.log("ISPASSWORDCORRECT", isPasswordCorrect);

            if (!isPasswordCorrect) {
                console.log("PASSWORD NOT MATCH");
                return res.status(400).json({
                    message: "your email or password might be wrong"
                })
            }

            const token = await authController.createToken({
                id: user[0].dataValues.id,
                nama_lengkap: user[0].dataValues.userid.dataValues.nama_lengkap,
                gender: user[0].dataValues.userid.dataValues.gender,
                goldar: user[0].dataValues.userid.dataValues.goldar,
                photo: user[0].dataValues.userid.dataValues.photo,
                email: user[0].dataValues.userid.dataValues.email,
                role: user[0].dataValues.userRoles.dataValues.role,
                roleID: user[0].dataValues.userRoles.id
            })

            res.status(201).json({
                result: token,
                message: "Successfully logged in"
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                error,
                message: "something went wrong when logging you in"
            })
        }
    },

    async daftarUserProfile(req, res) {
        try {
            const token = req.tokenPayload;

            uploadOnMemory.single("picture")(req, res, async function () {
                if (!req.file) {
                    const createdUser = await User.create({
                        nik: req.body.nik ? req.body.nik : "",
                        nama_lengkap: req.body.namalengkap ? req.body.namalengkap : "",
                        gender: req.body.gender ? req.body.gender : "",
                        goldar: req.body.goldar ? req.body.goldar : "",
                        photo: "",
                    })

                    if (!createdUser) {
                        res.status(400).json({
                            message: "there is a duplicated data"
                        })
                    }

                    await Account.update({
                        userId: createdUser.dataValues.id
                    }, {
                        where: {
                            id: token.id
                        }
                    })

                    return res.status(204).json({
                        message: "Profile created",
                        result: createdUser
                    })
                }

                const toBase64 = req.file.buffer.toString("base64");
                const file = `data:${req.file.mimetype};base64,${toBase64}`;

                cloudinary.uploader.upload(file, async function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            message: "failed on uploading image"
                        })
                    }

                    const createdUser = await User.create({
                        nik: req.body.nik ? req.body.nik : "",
                        nama_lengkap: req.body.namalengkap ? req.body.namalengkap : "",
                        gender: req.body.gender ? req.body.gender : "",
                        goldar: req.body.goldar ? req.body.goldar : "",
                        photo: result.url ? result.url : "",
                    })

                    if (!createdUser) {
                        res.status(400).json({
                            message: "there is a duplicated data"
                        })
                    }

                    await Account.update({
                        userId: createdUser.dataValues.id
                    }, {
                        where: {
                            id: token.id
                        }
                    })

                    return res.status(204).json({
                        message: "Profile created",
                        result: createdUser
                    })
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "one of your data is already exist in our database"
            })
        }
    },

    async getUser(req, res) {
        try {
            const bearerToken = req.headers.authorization;
            const token = bearerToken.split("Bearer ")[1];
            const tokenPayload = jwt.verify(token, "Rahasia");
            const id = tokenPayload.id;
            console.log(tokenPayload)
            const requestUser = await Account.findOne({
                where: {
                    id: id
                },
                include: ["userid", "userRoles"]
            });
            if (requestUser) {
                res.status(200).json({
                    user: {
                        id: requestUser.id,
                        nama: requestUser.userid.nama_lengkap ? requestUser.userid.nama_lengkap : "",
                        gender: requestUser.userid.gender ? requestUser.userid.gender : "",
                        golongan_darah: requestUser.userid.goldar ? requestUser.userid.goldar : "",
                        photo: requestUser.userid.photo ? requestUser.userid.photo : "",
                        email: requestUser.email
                    }
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "unauthorized access"
            })
        }
    },

    async updateUser(req, res) {
        try {
            const token = req.tokenPayload;
            const id = token.id;
            const initial = await Account.findByPk(id);
            const currentUser = await User.findOne({
                where: {
                    id: initial.userId
                }
            })

            uploadOnMemory.single("picture")(req, res, async function () {
                if (!req.file) {
                    await User.update({
                        nik: req.body.nik ? req.body.nik : initial.nik,
                        nama_lengkap: req.body.namalengkap ? req.body.namalengkap : initial.nama_lengkap,
                        gender: req.body.gender ? req.body.gender : initial.gender,
                        goldar: req.body.goldar ? req.body.goldar : initial.goldar,
                        photo: initial.photo,
                    }, {
                        where: {
                            id: currentUser.id
                        }
                    })

                    return res.status(204).json({
                        message: "update successful"
                    })
                }

                const toBase64 = req.file.buffer.toString("base64");
                const file = `data:${req.file.mimetype};base64,${toBase64}`;

                cloudinary.uploader.upload(file, async function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            message: "failed on uploading image"
                        })
                    }

                    await User.update({
                        nik: req.body.nik ? req.body.nik : initial.nik,
                        nama_lengkap: req.body.namalengkap ? req.body.namalengkap : initial.nama_lengkap,
                        gender: req.body.gender ? req.body.gender : initial.gender,
                        goldar: req.body.goldar ? req.body.goldar : initial.goldar,
                        photo: result.url ? result.url : initial.photo,
                    }, {
                        where: {
                            id: currentUser.id
                        }
                    })

                    return res.status(204).json({
                        message: "update successful"
                    })
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "you don't have access"
            })
        }
    },

    async deleteUser(req, res) {
        try {
            const token = req.tokenPayload;
            const account = await Account.findOne({
                where: {
                    id: token.id
                },
                include: ["userid", "userRoles"]
            })

            const profileId = account.dataValues.userid.id

            await Account.update({
                userId: null
            }, {
                where: {
                    id: token.id
                }
            })

            await User.destroy({
                where: {
                    id: profileId
                },

            })
            res.status(201).json({
                message: "user profile has been deleted"
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "there is something wrong when deleting your account"
            })
        }
    },

    async findAllUser(req, res) {
        try {
            const token = req.tokenPayload;
            const id = token.id;

            const currentUser = await Account.findOne({
                where: {
                    id: id
                },
                include: ["userRoles", "userid"]
            })

            const listUsers = await Account.findAll({
                include: ["userRoles", "userid"]
            });

            res.status(200).json({
                message: "this is your list of users data",
                accessedBy: currentUser.userid.nama_lengkap,
                as: currentUser.userRoles.role,
                result: listUsers,
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "unauthorized"
            })
        }
    },

    async findAllUserPaged(req, res) {
        try {
            const token = req.tokenPayload;
            const id = token.id;
            const page = req.query.page;
            const limit = req.query.limit;
            const startPoint = (page - 1) * limit;
            const endPoint = page * limit;

            const currentUser = await Account.findOne({
                where: {
                    id: id
                },
                include: ["userRoles", "userid"]
            })

            const listUsers = await Account.findAll({
                include: ["userRoles", "userid"]
            });

            const result = listUsers.slice(startPoint, endPoint);

            res.status(200).json({
                message: "this is your list of users data",
                accessedBy: currentUser.userid.nama_lengkap,
                as: currentUser.userRoles.role,
                result: result,
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "unauthorized"
            })
        }
    }
}