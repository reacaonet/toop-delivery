import { StatusDB } from '../../config/Database';

module.exports = {

    Show(req, res) {
        return res.status(200).send(
            {
                Status: StatusDB()
            }
        );
    }

}