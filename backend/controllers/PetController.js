const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

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
        _id: user._id,
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
    console.log("🚀 ~ getAllUserPets ~ user:", user)

    const pets = await Pet.find({ "user._id": (user._id) }).sort(
      "-createdAt"
    );
    console.log(pets);

    return res.status(200).json(pets);
  }

  static async getAllUserAdoptions(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "adopter._id": (user._id) }).sort(
      "-createdAt"
    );
    return res.status(200).json({ pets: pets });
  }

  static async getPetById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Id inválido" });
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado" });
    }

    return res.status(200).json({ pet: pet });
  }

  static async removePetById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um erro em processar a sua solicitação, tente novamente mais tarde",
      });
    }

    return res.status(200).json({ message: "Pet excluído", Pet: pet });
  }

  static async updatePet(req, res) {
    const id = req.params.id;

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() != user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um problema ao processar a sua solicitação, tente novamente mais tarde",
      });
    }

    const { name, age, weight, color, available } = req.body;

    const images = req.files;

    const updatedData = {};

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    } else {
      updatedData.name = name;
    }

    if (!age) {
      return res.status(422).json({ message: "A idade é obrigatório" });
    } else {
      updatedData.age = age;
    }

    if (!weight) {
      return res.status(422).json({ message: "O peso é obrigatório" });
    } else {
      updatedData.weight = weight;
    }

    if (!color) {
      return res.status(422).json({ message: "A cor é obrigatória" });
    } else {
      updatedData.color = color;
    }

    if (images.length === 0) {
      return res.status(422).json({ message: "A imagem é obrigatória" });
    } else {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findOneAndUpdate({ _id: id }, updatedData);

    return res.status(200).json({ message: "Pet atualizado com sucesso" });
  }

  static async schedule(req, res) {
    const id = req.params.id;

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(422).json({ message: "Pet não encontrado" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      return res.status(422).json({
        message: "Você não pode agendar uma visita com seu próprio pet!",
      });
    }

    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        return res
          .status(422)
          .json({ message: "Você já agendou uma visita para este pet" });
      }
    }

    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(
      id,
      { $set: { adopter: pet.adopter } },
      { new: true }
    );

    return res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`,
    });
  }

  static async conclludeAdoption(req, res) {
    const id = req.params.id;

    const pet = await Pet.findById({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    console.log("usuário ", user);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Houve um problema em processar sua solicitação, tente novamente mais tarde!",
      });
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);

    return res
      .status(200)
      .json({
        message: "Parabéns, o ciclo de adoção foi finalizado com sucesso",
      });
  }
};
