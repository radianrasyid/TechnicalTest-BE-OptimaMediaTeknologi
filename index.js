const express = require("express")
const app = express()
const bodyparser = require("body-parser")
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");

const cors = require("cors")

app.use(bodyparser.urlencoded({
    extended: true
}))
app.use(bodyparser.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "berhasil"
    })
})

app.get("/api/users/findallpage", authController.authorizeAdmin, userController.findAllUserPaged);
app.get("/api/users/findall", authController.authorizeAdmin, userController.findAllUser)
app.post("/api/users/createprofile", authController.authorizeUser, userController.daftarUserProfile)
app.get("/api/users/whoami", userController.getUser)
app.post("/api/users/login", userController.login)
app.post("/api/users/register", userController.register)
app.put("/api/users/update", authController.authorizeUser, userController.updateUser);
app.delete("/api/users/delete", authController.authorizeUser, userController.deleteUser);

app.listen(8000, function () {
    console.log(`listening on http://localhost:${this.address().port}`);
})