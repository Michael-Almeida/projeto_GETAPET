const router = require("express").Router();

const PetController = require("../controllers/PetController");
const { imageUpload } = require("../helpers/image-upload");

const verifyToken = require("../helpers/verify-token");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);

module.exports = router;
