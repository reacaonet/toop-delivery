const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    ddi: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    birthDate: {
      type: String,
      required: false,
    },
    cpf: {
      type: String,
      required: false,
    },
    nif: {
      type: String,
      required: false,
    },
    CCfront: {
      type: String,
      required: false,
    },
    CCVerse: {
      type: String,
      required: false,
    },
    rg: {
      type: String,
      required: false,
    },
    genre: {
      type: String,
      enum: ["H", "M", "O"],
      required: false,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    Region: {
      type: String,
      required: false,
    },
    selfiePhoto: {
      type: String,
      required: false,
    },
    CNHDocumentPhoto: {
      type: String,
      required: false,
    },
    CRLVDocumentPhoto: {
      type: String,
      required: false,
    },
    UniqueDocument: {
      type: String,
      required: false,
    },
    UniqueDocumentVerse: {
      type: String,
      required: false,
    },
    SecurityMotorcycle: {
      type: String,
      required: false,
    },
    Security: {
      type: String,
      required: false,
    },
    Comercial: {
      type: String,
      required: false,
    },
    VehiclePhoto: {
      type: String,
      required: false,
    },
    VehicleMatriculation: {
      type: String,
      required: false,
    },
    ImageCardFront: {
      type: String,
      required: false,
    },
    ImageCardVerse: {
      type: String,
      required: false,
    },
    GreenCard: {
      type: String,
      required: false,
    },
    bank: {
      type: String,
      required: false,
    },
    CriminalRecord: {
      type: String,
      required: false,
    },
    ComprovativoInicioAtividade: {
      type: String,
      required: false,
    },
    DrivingLicenseFront: {
      type: String,
      required: false,
    },
    DrivingLicenseVerse: {
      type: String,
      required: false,
    },
    ProofStartOrCompanyCertificate: {
      // Comprovativo de início de atividade ou Certidão permanente da empresa
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      default: "PENDENTE",
    },
    password: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    bankData: {
      name: {
        type: String,
        required: false,
      },
      cpfCnpj: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      bank: {
        type: String,
        required: false,
      },
      agency: {
        type: String,
        required: false,
      },
      account: {
        type: String,
        required: false,
      },
      iban: {
        type: String,
        required: false,
      },
      swift: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
    },
    vehicleManufacturer: {
      // Fabricante do veiculo
      type: String,
      required: false,
    },
    vehicleModel: {
      // modelo do veiculo
      type: String,
      required: false,
    },
    vehicleNameplate: {
      // Placa de Identificação
      type: String,
      required: false,
    },
    vehicleYear: {
      type: Number,
      required: false,
    },
    vehicleColor: {
      type: String,
      required: false,
    },
    terms: {
      type: Boolean,
      required: false,
      default: false,
    },
    viewStopRegister: {
      // Ultima tela de cadastro enviada
      type: String,
      required: false,
      default: "",
    },
    viewNextRegister: {
      // Próxima tela de cadastro
      type: String,
      required: false,
      default: "",
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "application",
      required: false,
    },
    country: {
      type: String,
      required: false,
      default: "",
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    appversion: {
      type: String,
      required: false,
    },
    operationalSystem: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ franchise: -1 });
schema.index({ phone: -1 });
schema.index({ ddi: -1 });
schema.index({ email: -1 });
schema.index({ cpf: -1 });
schema.index({ nif: -1 });
schema.index({ status: -1 });
schema.index({ createdAt: -1 });
schema.index({ deletedAt: -1 });

const PreRegistrationModel = model("PreRegistration", schema, "preRegistration");
module.exports = PreRegistrationModel;
