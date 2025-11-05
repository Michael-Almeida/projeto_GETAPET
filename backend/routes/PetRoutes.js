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

router.get("/",PetController.getAll)
router.get("/mypets",verifyToken,PetController.getAllUserPets)
router.get("/myadoptions",verifyToken,PetController.getAllUserAdoptions)

module.exports = router;
