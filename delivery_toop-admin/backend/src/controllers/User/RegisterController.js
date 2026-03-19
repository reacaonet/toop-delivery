const bcrypt = require('bcrypt');
const User = require('../../models/UserModel');

module.exports = async (req, res) => {
    try{
       let { name,email,password } = req.body
       let newUser = new User(req.body);

        if( !name || !email || !password )
            return res.status(401).send({msg: 'Envie os dados para cadastro!!'})


        await existEmail(email,res)
        newUser.password = await bcrypt.hash(password,11)
        await newUser.save()

        return res.status(200).send(newUser)

    } catch(err){
        //console.log('Error ', err)
        return res.status(501).end()
    }
}


const existEmail = async (email,res) => {
    let isEmail = await User.findOne({email}).lean();
    if( isEmail ){
        return res.status(400).send({
            path : 'Email',
            message : 'Email já se encontra cadastrado'
        });
    }
}
