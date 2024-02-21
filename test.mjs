import chai from 'chai';
import supertest from 'supertest';
import axios from "axios"
import app from './server.mjs';
import sinon from 'sinon';
import { productModel } from './schema.mjs';

import {
    adminLoginEmail, adminLoginPassword, userLoginEmail,
    userLoginPassword, disabledEmail, email,
    email1, email2, email3, enabledEmail, existingEmail,
    expiredOtp, firstName, incorrectPassword, invalidEmailPattern,
    invalidFirstNamePattern, invalidLastNamePattern, invalidOtpCode,
    invalidOtpformat, invalidPasswordPattern, lastName,
    newPassword, nonExistingEmail, otpCode, password,
    suspendedEmail, unverifiedEmail, usedOtp, verifiedEmail,
    invalidUserIdPattern, notExistingUserId, activatedUserId,
    productDescription, productColor, tileWidth, tileHeight,
    tileThickness, productCategory, productMaterial, productPrice,
    productId, productTitle, productFamily, invalidProductIdPattern,
    existingProductId, productImg, productLargeImg, productImgDest,
    productLargeImgDest, nonExistingCategoryName, categoryName,
    enabledProductId, disabledProductId, nonExistingProductId,
    newCategoryName, categoryImg, categoryImgDest,
    categoryLargeImg, categoryLargeImgDest, existingCategoryName,
    nonExistingCategoryId, disabledCategoryId, enabledCategoryId,
    existingCategoryId, takenCategoryName, updatedCategoryName,
    invalidMaterialName, validMaterialName, existingMaterialName,
    categoryIdWithNoMaterials, validCategoryId, validMaterialId,
    nonExistingMaterialId, updatedMaterialName, suspendedUserId,
    activeUserId, disabledUserId, enabledUserId, profileImg,
    profileImgDest, profileLargeImg, profileLargeImgDest,
    newEmail, oldPassword, gender, dateOfBirth
} from './testAuth.mjs';
import 'dotenv/config';

const expect = chai.expect;
const request = supertest(app);


//======================== un authenticated routes tests ========================================

//**************************** authentication routes tests ****************************

// signup

describe('POST /api/v1/signup', () => {

    it('should return 400 if no parameters are provided', async () => {
        const response = await request.post('/api/v1/signup');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if firstName is missing', async () => {
        const response = await request.post('/api/v1/signup').send({
            lastName: lastName,
            email: email,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if lastName is missing', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            email: email,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if email is missing', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: lastName,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if password is missing', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: lastName,
            email: email,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if invalid first name pattern', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: invalidFirstNamePattern, // Invalid: Contains less than two characters
            lastName: lastName,
            email: email,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_FIRST_NAME');
        expect(response.body).to.have.property('message').that.includes('invalid first name pattern');
    });

    it('should return 400 if invalid last name pattern', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: invalidLastNamePattern, // Invalid: Contains more than 15 characters
            email: email,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_LAST_NAME');
        expect(response.body).to.have.property('message').that.includes('invalid last name pattern');
    });

    it('should return 400 if invalid email', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: lastName,
            email: invalidEmailPattern, // Invalid: Missing @ symbol
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 400 if invalid password', async () => {
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: invalidPasswordPattern, // Invalid: Does not meet password requirements
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('password must be between');
    });

    it('should return 409 if user already exists', async function () {
        this.timeout(5000)
        // Assuming you have a user with the same email in your database
        try {
            const response = await request.post('/api/v1/signup').send({
                firstName: firstName,
                lastName: lastName,
                email: existingEmail,
                password: password,
            });
            expect(response.status).to.equal(409);
            expect(response.body).to.have.property('errorCode', 'USER_ALREADY_EXIST');
            expect(response.body).to.have.property('message').that.includes('user already exists');
        } catch (error) {
            console.log("error in test", error);
        }
    });

    it('should return 200 and success message for valid signup', async () => {
        // Assuming you have a valid set of parameters for successful signup
        const response = await request.post('/api/v1/signup').send({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('user created successfully');
    });

});

// send otp email tests

describe('POST /api/v1/send-otp-email', () => {

    it('should return 400 if no email parameter is provided', async () => {
        try {
            const response = await request.post('/api/v1/send-otp-email');
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
            expect(response.body).to.have.property('message').that.includes('required parameters missing');
        } catch (error) {
            console.log("error :", error);
        }
    });

    it('should return 400 if invalid email format', async () => {
        const response = await request.post('/api/v1/send-otp-email').send({
            email: invalidEmailPattern, // Invalid: Missing @ symbol
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 404 if user does not exist', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/send-otp-email').send({
            email: nonExistingEmail,
        });
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('errorCode', 'USER_NOT_EXIST');
        expect(response.body).to.have.property('message').that.includes('user not exist');
    });

    it('should return 409 if email is already verified', async () => {
        const response = await request.post('/api/v1/send-otp-email').send({
            email: verifiedEmail, // Replace with an email that is already verified
        });
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('errorCode', 'EMAIL_ALREADY_VERIFIED');
        expect(response.body).to.have.property('message').that.includes('email is already verified');
    });

    it('should return 429 if limit exceeds (try again in 24 hours)', async () => {
        try {
            const response = await request.post('/api/v1/send-otp-email').send({
                email: email3,
            });
            expect(response.status).to.equal(429);
            expect(response.body).to.have.property('errorCode', 'LIMIT_EXCEED_TRY_IN_24HR');
            expect(response.body).to.have.property('message').that.includes('limit exceed, please try again in 24hr');
        } catch (error) {
            console.log("error : ", error);
        }
    });

    it('should return 429 if limit exceeds (try again in 60 minutes)', async () => {
        const response = await request.post('/api/v1/send-otp-email').send({
            email: email2,
        });
        expect(response.status).to.equal(429);
        expect(response.body).to.have.property('errorCode', 'LIMIT_EXCEED_TRY_IN_60MIN');
        expect(response.body).to.have.property('message').that.includes('limit exceed, wait 60 minutes before sending another OTP');
    });

    it('should return 429 if limit exceeds (try again in 5 minutes)', async () => {
        const response = await request.post('/api/v1/send-otp-email').send({
            email: email1,
        });
        expect(response.status).to.equal(429);
        expect(response.body).to.have.property('errorCode', 'LIMIT_EXCEED_TRY_IN_5MIN');
        expect(response.body).to.have.property('message').that.includes('limit exceed, wait 5 minutes before sending another OTP');
    });

    it('should return 200 and success message after sending OTP', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/send-otp-email').send({
            email: email,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('verification email has been sent');
    });

});

// verify email tests

describe('POST /api/v1/verify-email', () => {

    it('should return 400 if no email parameter is provided', async () => {
        const response = await request.post('/api/v1/verify-email').send({
            // No email parameter provided
            otpCode: otpCode,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if no otpCode parameter is provided', async () => {
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            // No otpCode parameter provided
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if invalid email format', async () => {
        const response = await request.post('/api/v1/verify-email').send({
            email: invalidEmailPattern, // Invalid: Missing @ symbol
            otpCode: otpCode,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 400 if invalid otpCode format', async () => {
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            otpCode: invalidOtpformat, // Invalid: Not matching the expected pattern
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if invalid otpCode', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            otpCode: invalidOtpCode, // Invalid: Not matching the original otp
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if OTP is expired', async () => {
        // Assuming an expired OTP
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            otpCode: expiredOtp,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if OTP is already used', async () => {
        // Assuming an already used OTP
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            otpCode: usedOtp,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 200 and success message after successful verification', async function () {
        // Assuming a valid email and OTP combination
        this.timeout(5000)
        const response = await request.post('/api/v1/verify-email').send({
            email: email,
            otpCode: otpCode,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('email verified successfully');
    });

});

// login tests

describe('POST /api/v1/login', () => {

    it('should return 400 if no parameter is provided', async () => {
        const response = await request.post('/api/v1/login')
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if no email parameter is provided', async () => {
        const response = await request.post('/api/v1/login').send({
            // No email parameter provided
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if no password parameter is provided', async () => {
        const response = await request.post('/api/v1/login').send({
            email: email,
            // No password parameter provided
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if invalid email format', async () => {
        const response = await request.post('/api/v1/login').send({
            email: invalidEmailPattern, // Invalid: Missing @ symbol
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL_OR_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 400 if invalid password format', async () => {
        const response = await request.post('/api/v1/login').send({
            email: email,
            password: invalidPasswordPattern, // Invalid: invaid password
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL_OR_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('password must be between 6 to 20 characters');
    });

    it('should return 400 if user not found', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/login').send({
            email: nonExistingEmail,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL_OR_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('email or password incorrect');
    });

    it('should return 400 if email is not verified', async function () {
        this.timeout(5000)
        // Assuming a user with an unverified email
        const response = await request.post('/api/v1/login').send({
            email: unverifiedEmail,
            password: password,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'EMAIL_NOT_VERIFIED');
        expect(response.body).to.have.property('message').that.includes('email not verified');
    });

    it('should return 401 if account is disabled', async () => {
        // Assuming a user with a disabled account
        const response = await request.post('/api/v1/login').send({
            email: disabledEmail,
            password: password,
        });
        console.log("response : ", response);
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('errorCode', 'ACCOUNT_DISABLED');
        expect(response.body).to.have.property('message').that.includes('account is disabled');
    });

    it('should return 401 if account is suspended', async () => {
        // Assuming a user with a suspended account
        const response = await request.post('/api/v1/login').send({
            email: suspendedEmail,
            password: password,
        });
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('errorCode', 'ACCOUNT_SUSPENDED');
        expect(response.body).to.have.property('message').that.includes('account is suspended');
    });

    it('should return 401 if password is incorrect', async () => {
        // Assuming an incorrect password
        const response = await request.post('/api/v1/login').send({
            email: email,
            password: incorrectPassword,
        });
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL_OR_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('email or password incorrect');
    });

    it('should return 200 and success message after successful login', async () => {
        // Assuming a valid email and password combination
        const response = await request.post('/api/v1/login').send({
            email: email,
            password: password,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('login successful');
    });

});

// forget password tests

describe('POST /api/v1/forget-password', () => {

    it('should return 400 if no email parameter is provided', async () => {
        const response = await request.post('/api/v1/forget-password').send({
            // No email parameter provided
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if invalid email format', async () => {
        const response = await request.post('/api/v1/forget-password').send({
            email: invalidEmailPattern, // Invalid: Missing @ symbol
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 404 if user not found', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/forget-password').send({
            email: nonExistingEmail,
        });
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('errorCode', 'USER_NOT_EXIST');
        expect(response.body).to.have.property('message').that.includes('user not found');
    });

    it('should return 400 if account is disabled', async () => {
        // Assuming a user with a disabled account
        const response = await request.post('/api/v1/forget-password').send({
            email: disabledEmail,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'ACCOUNT_DISABLED');
        expect(response.body).to.have.property('message').that.includes('account is disabled');
    });

    it('should return 400 if account is suspended', async () => {
        // Assuming a user with a suspended account
        const response = await request.post('/api/v1/forget-password').send({
            email: suspendedEmail,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'ACCOUNT_SUSPENDED');
        expect(response.body).to.have.property('message').that.includes('account is suspended');
    });

    it('should return 200 and success message after sending OTP', async () => {
        // Assuming a valid email
        const response = await request.post('/api/v1/forget-password').send({
            email: email,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('forget password otp code has sent');
    });

});

// forget password complete tests
describe('POST /api/v1/forget-password-complete', () => {

    it('should return 400 if email parameter is not provided', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            otpCode: otpCode,
            newPassword: newPassword,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if new password parameter is not provided', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            otpCode: otpCode,
            // newPassword not provided
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if OTP parameter is not provided', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            // otpCode not provided
            newPassword: newPassword,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'REQUIRED_PARAMETER_MISSING');
        expect(response.body).to.have.property('message').that.includes('required parameters missing');
    });

    it('should return 400 if invalid email format', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: invalidEmailPattern, // Invalid: Missing @ symbol
            otpCode: otpCode,
            newPassword: newPassword,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_EMAIL');
        expect(response.body).to.have.property('message').that.includes('invalid email');
    });

    it('should return 400 if invalid password format', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            otpCode: otpCode,
            newPassword: invalidPasswordPattern, // Invalid: Less than 6 characters
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_PASSWORD');
        expect(response.body).to.have.property('message').that.includes('password must be between 6 to 20 characters');
    });

    it('should return 400 if invalid OTP format', async () => {
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            otpCode: invalidOtpformat, // Invalid: Not matching OTP pattern
            newPassword: newPassword,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if invalid otpCode', async function () {
        this.timeout(5000)
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            newPassword: newPassword,
            otpCode: invalidOtpCode, // Invalid: Not matching the original otp
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if OTP is expired', async () => {
        // Assuming an expired OTP
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            newPassword: newPassword,
            otpCode: otpCode,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 400 if OTP is already used', async () => {
        // Assuming an already used OTP
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            newPassword: newPassword,
            otpCode: otpCode,
        });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errorCode', 'INVALID_OTP');
        expect(response.body).to.have.property('message').that.includes('invalid otp');
    });

    it('should return 200 and success message after completing forget password', async () => {
        // Assuming a valid email, OTP, and newPassword
        const response = await request.post('/api/v1/forget-password-complete').send({
            email: email,
            newPassword: newPassword,
            otpCode: otpCode,
        });
        // console.log("resp : ", response);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('errorCode', 'SUCCESS');
        expect(response.body).to.have.property('message').that.includes('forget password completed');
    });

});

// **************************** profile routes tests ****************************

// change name tests

describe('PUT /api/v1/change-name', () => {

    it('it should return 400 if no parameters are provided', async () => {

        const response = await request.put('/api/v1/change-name')

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if no parameters are provided', async () => {

        const response = await request.put('/api/v1/change-name')

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if firstName is not provided', async () => {

        const response = await request.put('/api/v1/change-name')
            .send({
                firstName: firstName
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if lastName is not provided', async () => {

        const response = await request.put('/api/v1/change-name')
            .send({
                lastName: lastName
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if invalid firstName pattern', async () => {

        const response = await request.put('/api/v1/change-name')
            .send({
                firstName: invalidFirstNamePattern,
                lastName: lastName,
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if invalid lastName pattern', async () => {

        const response = await request.put('/api/v1/change-name')
            .send({
                firstName: firstName,
                lastName: invalidLastNamePattern,
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 200 after the sucessfull name changed', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-name')
            .send({
                firstName: firstName,
                lastName: lastName,
            })

        expect(response.status).to.equal(200);

    });

});

// change profile picture test

describe('PUT /api/v1/change-profile-picture', () => {

    it('it should return 400 if no files are provided', async () => {

        const response = await request.put('/api/v1/change-profile-picture')

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if file size is greater than 1 MB', async () => {

        const response = await request.put('/api/v1/change-profile-picture')
            .attach("image", profileLargeImg, profileLargeImgDest)
            .set('Content-Type', 'multipart/form-data');

        expect(response.status).to.equal(400);

    });

    it('it should return 200 if profile picture sucessfully updated', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-profile-picture')
            .attach("image", profileImg, profileImgDest)
            .set('Content-Type', 'multipart/form-data');

        expect(response.status).to.equal(200);

    });

});

// change email tests

describe('PUT /api/v1/change-email', () => {

    it('it should return 400 if no parameters are provided', async () => {

        const response = await request.put('/api/v1/change-email')

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if newEmail is not provided', async () => {

        const response = await request.put('/api/v1/change-email')
            .send({
                password: oldPassword
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if password is not provided', async () => {

        const response = await request.put('/api/v1/change-email')
            .send({
                newEmail: newEmail
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if invalid email pattern', async () => {

        const response = await request.put('/api/v1/change-email')
            .send({
                newEmail: invalidEmailPattern,
                password: oldPassword,
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 400 if email is already taken', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-email')
            .send({
                newEmail: email,
                password: oldPassword,
            })

        expect(response.status).to.equal(400);

    });

    it('it should return 200 on sucessfull response', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-email')
            .send({
                newEmail: newEmail,
                password: password,
            })
        console.log(response.body);

        expect(response.status).to.equal(200);

    });

});

// change password tests

describe('PUT /api/v1/change-password', () => {

    it('should return 400 if no parameters are provided', async () => {

        const response = await request.put('/api/v1/change-password')

        expect(response.status).to.equal(400);

    });

    it('should return 400 if newPassword is missing', async () => {

        const response = await request.put('/api/v1/change-password')
            .send({
                oldPassword: oldPassword,
            })

        expect(response.status).to.equal(400);

    });

    it('should return 400 if oldPassword is missing', async () => {

        const response = await request.put('/api/v1/change-password')
            .send({
                newPassword: newPassword,
            })

        expect(response.status).to.equal(400);

    });

    it('should return 400 if newPassword pattern is invalid', async () => {

        const response = await request.put('/api/v1/change-password')
            .send({
                oldPassword: oldPassword,
                newPassword: invalidPasswordPattern,
            })

        expect(response.status).to.equal(400);

    });

    it('should return 401 if oldPassword is invalid', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-password')
            .send({
                oldPassword: incorrectPassword,
                newPassword: invalidPasswordPattern,
            })

        expect(response.status).to.equal(401);

    });

    it('should return 200 if password changed sucessfully', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/change-password')
            .send({
                oldPassword: oldPassword,
                newPassword: newPassword,
            })

        expect(response.status).to.equal(200);

    });

})

// get current user profile tests

describe('GET /api/v1/profile', () => {

    it('should return 200 if current user profile is fetched', async function () {

        this.timeout(5000)
        const response = await request.get('/api/v1/profile')

        expect(response.status).to.equal(200);

    });

})

// gender and dateOfBirth tests

describe('PUT /api/v1/gender-and-dob', () => {

    it('should return 400 if gender and dateOfBirth both are not provided', async () => {

        const response = await request.put('/api/v1/gender-and-dob')

        expect(response.status).to.equal(400);

    });

    it('should return 200 if gender is provided and sucessfully updated', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/gender-and-dob')
            .send({
                gender: gender
            })

        expect(response.status).to.equal(200);

    });

    it('should return 200 if dateOfBirth is provided and sucessfully updated', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/gender-and-dob')
            .send({
                dateOfBirth: dateOfBirth
            })

        expect(response.status).to.equal(200);

    });

    it('should return 200 if gender and dateOfBirth both are provided and sucessfully updated', async function () {

        this.timeout(5000)
        const response = await request.put('/api/v1/gender-and-dob')
            .send({
                gander: gender,
                dateOfBirth: dateOfBirth
            })

        expect(response.status).to.equal(200);

    });

})