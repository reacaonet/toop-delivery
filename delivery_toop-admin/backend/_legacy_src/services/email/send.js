const mailer = require("./../../config/nodemailer");
const Log = require("../../models/LogModel");
const EmailTypeModel = require("../../models/Email/EmailTypeModel");
const EmailTemplateModel = require("../../models/Email/EmailTemplateModel");

const mongoose = require("mongoose");

//const variables = [{"[[cliente]]": "Jackiê Macklein"}];
// to = 'email1, email2, email3';
const sendEmail = async (to = "", subject = "", body = "", variables = [], name = "", template_key = null, franchise = null) => {
  log(`sending email named ${name}`, "email-send", "WARN", false, "email");
  try {
    if (template_key) {
      // get template
      const type = await EmailTypeModel.findOne({
        key: template_key,
        deletedAt: { $exists: false },
        status: true,
      });

      if (type) {
        const template = await EmailTemplateModel.findOne({
          type: mongoose.Types.ObjectId(type._id),
          deletedAt: { $exists: false },
          status: true,
          franchise: mongoose.Types.ObjectId(franchise),
        });

        if (template) {
          body = template.body;
          subject = template.subject;
        }
      }
    }

    const info = await mailer.transport.sendMail({
      from: `"${mailer.from_name}" <${mailer.from_email}>`,
      to,
      subject,
      html: replaceVariables(variables, body),
    });

    if (info.messageId) {
      log(`email successfully sent to ${name}`, "email-send", "SUCCESS", false, "email");
      return true;
    } else {
      log(`email not sent to ${name}`, "email-send", "ERROR", false, "email");
      return false;
    }
  } catch (error) {
    log({ message: "catch error send email", error: JSON.stringify(error) }, "email-send", "ERROR", true, "email");
  }
};

const replaceVariables = (variables = [], html = "") => {
  variables.map(variable => {
    const index = Object.keys(variable)[0];
    const value = variable[index];
    const replacer = new RegExp(index, "g");

    html = html.replace(replacer, value);
  });

  return html;
};

const log = (payload, originError, typeLog = "ERROR", isError = true, category = "email") => {
  try {
    let descripPayload = {};

    if (isError) {
      descripPayload = {
        message: payload.message,
        err: payload,
      };
    } else {
      descripPayload = payload;
    }

    Log.create({
      typeSystem: "BACKEND",
      typeLog: typeLog,
      description: descripPayload,
      category: category,
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

module.exports = sendEmail;
