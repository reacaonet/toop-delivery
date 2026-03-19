require('dotenv/config');

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(dirtyChai);
chai.use(chaiHttp);

describe('Health', () => {

    it('Checks if the theft is returning 200', () => {
        chai
            .request(`http://${process.env.HOST}:${process.env.PORT}/${process.env.VERSION_IN_TEST}`)
            .get('/health')
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });

});
