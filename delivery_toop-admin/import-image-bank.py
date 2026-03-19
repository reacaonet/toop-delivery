#python -m pip install pandas
#python -m pip install pymongo
#python -m pip install xlrd

import pandas;


from pymongo import MongoClient; 

cliente = MongoClient('localhost', 27017);

banco = cliente.economize_br;

imageBank = banco.imageBank
imageBankImport = banco.imagemImport

data = pandas.read_excel("D:/tbl_mercado_97_categoria.xlsx")

for item in data.values:

    image = None
    images = []

    if(str(item[10]) is not None and str(item[10]) != 'nan'):
        imagem = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/imagebank/png/' +  str(item[10])
        images.append(imagem)
    
    if(str(item[11]) is not None and str(item[11]) != 'nan'):
        imagem = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/imagebank/jpg/' +  str(item[11])
        images.append(imagem)


    itemImageBank = {
        "packing":item[8],
        "images": images,
        "barcode": str(item[0]),
        "productName":item[3],
        "productAccent":item[1],
        "description":item[7],
        "keywords":"",
        "packingAmount": int(item[9]),
        "category":item[13],
        "brand":item[12]
    }

    itemImageBankBase = {
        "codbar":str(item[0]),
        "images": images,
        "produto": item[3],
        "produto_upper":item[2],
        "produto_acento":item[1],
        "peso":item[4],
        "ncm":item[5],
        "keywords":"",
        "cest_codigo": item[6],
        "cest_descricao":item[7],
        "embalagem":item[8],
        "quantidade_embalagem":item[9],
        "marca":item[12],
        "categoria":item[13]       
    }

    imageBank.insert_one(itemImageBank)
    imageBankImport.insert_one(itemImageBankBase)

