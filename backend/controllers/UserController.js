const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body;
    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }
    if (!phone) {
      return res.status(422).json({ message: "O telefone é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatório" });
    }
    if (!confirmpassword) {
      return res
        .status(422)
        .json({ message: "A confirmação de senha é obrigatório" });
    }

    if (password !== confirmpassword) {
      res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais",
      });
      return;
    }

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res
        .status(422)
        .json({ message: "Usuário já existe, utilize outro e-mail" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });
    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);

      return res.status(200).json({ message: "Usuário criado", newUser });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ message: "E-mail é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ message: "Senha é obrigatória" });
    }
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).json({ message: "Usuário não localizado" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ message: "Senha incorreta" });
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    console.log(req.headers.authorization);
    if (req.headers.authorization) {
      const token = getToken(req);
      console.log(token);
      const decoded = jwt.verify(token, "nossosecret");
      console.log(decoded);
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findById(id).select("-password");
      console.log(user);

      if (!user) {
        return res.status(422).json({ message: "Usuário não localizado" });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  static async editUser(req, res) {
    const { id } = req.params;

    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmpassword } = req.body;

    const image = "";

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }

    const userExist = await User.findOne({ email: email });
    if (user.email !== email && userExist) {
      return res.status(422).json({
        message: "Por favor utilize outro e-mail",
      });
    }

    if (!phone) {
      return res.status(422).json({ message: "O telefone é obrigatório" });
    }

    user.phone = phone;

    if (password !== confirmpassword) {
      return res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais",
      });
    } else if (password === confirmpassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      const updateUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
};
