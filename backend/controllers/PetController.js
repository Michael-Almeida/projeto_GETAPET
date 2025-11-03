const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

const Pet = require("../models/Pet");

module.exports = class PetController {
  static async create(req, res) {
    const { name, age, weight, color } = req.body;

    const available = true;

    //images upload

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }

    if (!age) {
      return res.status(422).json({ message: "A idade é obrigatório" });
    }

    if (!weight) {
      return res.status(422).json({ message: "O peso é obrigatório" });
    }

    if (!color) {
      return res.status(422).json({ message: "A cor é obrigatória" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user.id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    try {
      const newPet = await pet.save();
      res.status(201).json({
        message: "Pet cadastrado com sucesso",
        newPet,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
