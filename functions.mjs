import nodemailer from 'nodemailer';
import { errorCodes } from './core.mjs';
import app from './server.mjs';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import "dotenv/config";

// send email
export const sendEmail = (email, firstName, subject, html) => {

    return new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: process.env.NODE_MAILER_EMAIL,
                    pass: process.env.NODE_MAILER_PASSWORD
                }
            });

            const mail = await transporter.sendMail({
                from: '"Abdul Ahad" <ahad.btkit@gmail.com>',
                to: `${email}`,
                subject: subject,
                text: `Hello ${firstName}`,
                html: html,
            });

            await transporter.sendMail(mail);
            resolve(); // Resolve the Promise once the email is sent successfully
        } catch (error) {
            console.error(error);
            reject({
                message: 'Error sending email',
                errorCode: errorCodes.UNKNOWN_SERVER_ERROR
            });
        }
    });
};

// login token issue for tests
export const loginUserAndGetTokens = async (app, email, password) => {
    try {
        const request = supertest(app);
        const loginResponse = await request.post('/api/v1/login')
            .set('Content-Type', 'application/json')
            .send({
                email: email,
                password: password,
            });

        const cookies = loginResponse.headers['set-cookie'];
        const hart = cookies.find((cookie) => cookie.includes('hart')).split(';')[0].split('=')[1];
        const hartRef = cookies.find((cookie) => cookie.includes('hartRef')).split(';')[0].split('=')[1];

        return { hart, hartRef };
    } catch (error) {
        console.log(error);
    }
};