const router = require("express").Router();
const multer = require("multer");
const { uniqueID } = require("./../utils/index");

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: async function (req, file, cb) {
    if (!file) return false;
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split(".")[1];

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = uniqueID();

    req.file_path = `public/${novoNomeArquivo}.${extensaoArquivo}`;
    req.file_name = `${novoNomeArquivo}.${extensaoArquivo}`;

    // Indica o novo nome do arquivo:
    await cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
  },
});

const upload = multer({ storage });

const sendFilesController = require("../controllers/SendFiles");

router.post("/", upload.single("file"), sendFilesController.method.create);

module.exports = router;
