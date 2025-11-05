const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

const Pet = require("../models/Pet");

module.exports = class PetController {
  static async create(req, res) {
    const { name, age, weight, color } = req.body;

    const images = req.files;

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

    if (images.length === 0) {
      return res.status(422).json({ message: "A imagem é obrigatória" });
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

    images.map((image) => {
      pet.images.push(image.filename);
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

  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");

    return res.status(200).json({ pets: pets });
  }

  static async getAllUserPets(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "user._id": String(user._id) }).sort(
      "-createdAt"
    );
    console.log(pets);

    return res.status(200).json(pets);
  }
  static async getAllUserAdoptions(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "adopter._id": String(user._id) }).sort(
      "-createdAt"
    );
    return res.status(200).json({ pets: pets });
  }
};
