require('dotenv/config');

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(dirtyChai);
chai.use(chaiHttp);

describe('App Notification', () => {

    it('Passing no information returns 404', () => {
        chai
            .request(`http://${process.env.HOST}:${process.env.PORT}/${process.env.VERSION_IN_TEST}`)
            .post('/app-notification/send')
            .then(function (res) {
                expect(res).to.have.status(404);
            });
    });

    it('Passing only the appkey, with nothing in the body', () => {
        chai
            .request(`http://${process.env.HOST}:${process.env.PORT}/${process.env.VERSION_IN_TEST}`)
            .post('/app-notification/send')
            .set('authorization', process.env.APP_KEY)
            .then(function (res) {
                expect(res).to.have.status(404);
            });
    });

    it('Passing only the appkey, with nothing in the body', () => {
        chai
            .request(`http://${process.env.HOST}:${process.env.PORT}/${process.env.VERSION_IN_TEST}`)
            .post('/app-notification/send')
            .set('authorization', process.env.APP_KEY)
            .then(function (res) {
                expect(res).to.have.status(404);
            });
    });

});
