const XLSX = require('xlsx');
const fs = require('fs');

function readExcel() {
  let xlsFile = "scripts/syncDepartment/file/LISTA DE PRODUTOS.xlsx";

  async function getExcel(barCode = 0, sheet = null, file = null) {
    try {
      let buf = XLSX.readFile(file);

      let sheetNameList = buf.SheetNames;
      let listExcel = [];

      if (!sheetNameList) {
        return {
          status: false,
          message: 'Informe um Excel com Listas ordenadas'
        }
      }

      if (sheet && sheet != "") {
        let resposne = sheetItens(buf, sheet, barCode);
        // console.log('Retornando Sheet ...', resposne[0]);
        return resposne;
      }

      if (barCode !== 0 && barCode !== null) {
        let resposne = startingBarcode(buf, barCode);
        return resposne;
      }

      for (const nameSheet of sheetNameList) {
        listExcel.push(XLSX.utils.sheet_to_json(buf.Sheets[nameSheet]));
      }

      return listExcel;
    } catch (err) {
      return {
        status: false,
        message: 'Falha ao processar Excel ...',
        err: err.message,
      };
    }
  }

  function sheetItens(buf, sheet, barCode) {
    try {
      let listExcel = [];
      let jsonList = XLSX.utils.sheet_to_json(buf.Sheets[sheet]);

      if (barCode == 0 || barCode == null) {
        listExcel.push(jsonList);
        return listExcel;
      }

      let newList = [];
      let isAdd = false;

      for (const item of jsonList) {
        let listObjects = Object.keys(item);
        if (isAdd == false && `${item[listObjects[1]]}` === `${barCode}`) {
          isAdd = true;
        }

        if (isAdd) {
          newList.push(item);
        }
      }

      return newList;
    } catch (err) {
      return [];
    }
  }

  function startingBarcode (buf, barCode) {
    try {
      let listExcel = [];
      let sheetNameList = buf.SheetNames;
      let isAdd = false;

      for (const sheetName of sheetNameList) {
        let jsonList = XLSX.utils.sheet_to_json(buf.Sheets[sheetName]);
        let newList = [];

        if (isAdd == false) {
          for (const item of jsonList) {
            let listObjects = Object.keys(item);
            if (isAdd == false && `${item[listObjects[1]]}` === `${barCode}`) {
              isAdd = true;
            }

            if (isAdd) {
              newList.push(item);
            }
          }

          if (newList.length > 0) {
            listExcel.push(newList);
          }
        } else {
          listExcel.push(jsonList);
        }
      }

      return listExcel;
    } catch (err) {
      return [];
    }
  }

  return {
    getExcel,
  };
}

// readExcel().getExcel('7892300002449', 'LISTA 1');
// readExcel().getExcel('7896292305021');
// readExcel().getExcel(null, 'LISTA 1');
// readExcel().getExcel();
module.exports = readExcel;
