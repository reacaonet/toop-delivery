const router = require("express").Router();

const multer = require("multer");
const { uniqueID } = require("../../../utils");

// Configuração de armazenamento

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: async function (req, file, cb) {
    if (!file) return false;
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split(".")[1];

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = uniqueID();

    req.file_path = `public/uploads/${novoNomeArquivo}.${extensaoArquivo}`;
    req.file_name = `${novoNomeArquivo}.${extensaoArquivo}`;

    // Indica o novo nome do arquivo:
    await cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
  },
});

const upload = multer({ storage });

/** Controller */
const FileController = require("../../../controllers/v2/upload/FileController");

router.post("/", upload.single("file"), FileController);

module.exports = router;
