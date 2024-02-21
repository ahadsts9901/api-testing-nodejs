import express from 'express';
import { stringToHash, varifyHash } from "bcrypt-inzi";
import { ObjectId } from 'mongodb';
import fs from "fs"

import {
    emailPattern, passwordPattern, firstNamePattern, lastNamePattern,
    userModel
} from '../../schema.mjs';
import { errorCodes } from '../../core.mjs'
import { upload, bucket, handleMulterError } from '../../firebase.mjs';
import "dotenv/config"
import { issueLoginToken } from '../../middlewares.mjs';

let router = express.Router()

// logout api

router.post('/logout', async (req, res, next) => {

    try {
        // clear harts from cookies
        res.clearCookie('hart');
        res.clearCookie('hartRef');
        res.send({
            message: "logout successful",
            errorCode: errorCodes.SUCCESS
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "internal server error",
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        })
    }

})

// change user name

router.put('/change-name', async (req, res, next) => {

    // parameters validation
    if (!req?.body?.firstName || !req?.body?.lastName) {
        res.status(400).send({
            message: `required parameters missing, example request body: 
            {
                "firstName": "John",
                "lastName": "Doe"
            }
            `,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // validate first name
    if (!firstNamePattern.test(req?.body?.firstName)) {
        res.status(400).send({
            message: `invalid first name`,
            errorCode: errorCodes.INVALID_FIRST_NAME
        })
        return;
    }

    // validate last name
    if (!lastNamePattern.test(req?.body?.lastName)) {
        res.status(400).send({
            message: `invalid last name`,
            errorCode: errorCodes.INVALID_LAST_NAME
        })
        return;
    }

    const currentUser = req?.currentUser

    // check is id valid
    if (!ObjectId.isValid(currentUser?._id)) {
        res.status(400).send({
            message: `invalid user id`,
            errorCode: errorCodes.INVALID_USER_ID
        });
        return;
    }

    try {

        // find user
        const user = await userModel.findById(currentUser?._id).exec()

        if (!user) {
            res.status(400).send({
                message: `account not found`,
                errorCode: errorCodes.USER_NOT_EXIST
            })
            return
        }

        // update user
        user.firstName = req?.body?.firstName
        user.lastName = req?.body?.lastName
        await user.save()

        // more will be update

        req.user = {
            isAdmin: currentUser?.isAdmin,
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: currentUser?.email,
            _id: currentUser?._id,
            profilePhoto: currentUser?.profilePhoto,
            gender: currentUser?.gender,
            dateOfBirth: currentUser?.dateOfBirth,
            createdOn: currentUser?.createdOn,
        };

        next();

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'server error, please try later',
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        });
    }

},
    issueLoginToken,
    (req, res, next) => {
        res.send({
            message: "name updated successfully",
            errorCode: errorCodes.SUCCESS,
        })
    }
)

// change profile picture

router.put('/change-profile-picture', upload.any(), handleMulterError, async (req, res, next) => {

    // parameters validation
    if (!req?.files) {
        res.status(400).send({
            message: `required parameters missing, example request body:
                {
                    "profileImage": "your image"
                }`,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // size bytes, limit of 2MB
    if (req?.files[0].size > 2000000) {
        res.status(400).send({
            message: 'file size limit exceed, maximum limit 2MB',
            errorCode: errorCodes.FILE_SIZE_LIMIT_EXCEED
        });
        return;
    }

    // getting current user
    const currentUser = req.currentUser

    // // upload image
    bucket.upload(
        req?.files[0].path,
        {
            // give destination name
            destination: `profile-pictures/${req?.files[0].filename}`,
        },
        function (err, file, apiResponse) {
            if (!err) {

                // get signed url
                file.getSignedUrl({
                    action: 'read',
                    expires: '04-12-2123'
                }).then(async (urlData, err) => {
                    if (!err) {

                        // this is public downloadable url 
                        // console.log("url: ", urlData[0])
                        try {

                            // check is id valid
                            if (!ObjectId.isValid(currentUser?._id)) {
                                res.status(400).send({
                                    message: `invalid user id`,
                                    errorCode: errorCodes.INVALID_USER_ID
                                });
                                return;
                            }

                            // update user profile picture
                            const userUpdateResponse = await userModel
                                .updateOne(
                                    { _id: new ObjectId(currentUser?._id) },
                                    { $set: { profilePhoto: urlData[0] } }
                                );

                            // delete file from folder before 
                            // sending response back to 
                            // client (optional but recommended)

                            // optional because it is gonna delete 
                            // automatically sooner or later

                            // recommended because you may run 
                            // out of space if you dont do so, 
                            // and if your files are sensitive 
                            // it is simply not safe in server folder

                            try {
                                fs.unlinkSync(req?.files[0].path)
                                // file removed
                            } catch (err) {
                                console.error(err)
                                res.status(500).send({
                                    message:
                                        'server error, please try later',
                                    errorCode:
                                        errorCodes.UNKNOWN_SERVER_ERROR
                                });
                            }

                            req.user = {
                                isAdmin: currentUser?.isAdmin,
                                firstName: currentUser?.firstName,
                                lastName: currentUser?.lastName,
                                email: currentUser?.email,
                                _id: currentUser?._id,
                                profilePhoto: urlData[0],
                                gender: currentUser?.gender,
                                dateOfBirth: currentUser?.dateOfBirth,
                                createdOn: currentUser?.createdOn,
                            };

                            next();

                        } catch (error) {
                            console.error(error);
                            res.status(500).send({
                                message:
                                    'server error, please try later',
                                errorCode:
                                    errorCodes.UNKNOWN_SERVER_ERROR
                            });
                        }

                    }
                })
            } else {
                console.error(err)
                res.status(500).send({
                    message: 'server error, please try later',
                    errorCode: errorCodes.UNKNOWN_SERVER_ERROR
                });
            }
        }
    );
}, issueLoginToken,
    (req, res, next) => {
        res.send({
            message: "profile picture updated successfully",
            errorCode: errorCodes.SUCCESS,
        })
    }
)

// change email

router.put('/change-email', async (req, res, next) => {

    // parameters validation
    if (
        !req?.body?.newEmail ||
        !req?.body?.password
    ) {
        res.status(400).send({
            message: `required parameters missing, example request body:
                {
                    "newEmail": "john@example.com",
                    "password": "XXXXXXXX"
                }`,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // check email pattern
    if (!emailPattern.test(req?.body?.newEmail)) {
        res.status(400).send({
            errorCode: errorCodes.INVALID_EMAIL,
            message: "invalid email"
        })
        return;
    }

    // get current user
    const currentUser = req.currentUser

    // check is id valid
    if (!ObjectId.isValid(currentUser?._id)) {
        res.status(400).send({
            message: `invalid user id`,
            errorCode: errorCodes.INVALID_USER_ID
        });
        return;
    }

    try {

        // check is email already taken
        const isEmailTaken = await userModel
            .findOne({ email: req?.body?.newEmail })
            .exec();

        if (isEmailTaken) {
            res.status(400).send({
                message: 'email already taken',
                errorCode: errorCodes.EMAIL_ALREADY_TAKEN
            });
            return;
        }

        // is user available
        const user = await userModel
            .findById(new ObjectId(currentUser?._id))
            .exec();

        if (!user) {
            res.status(404).send({
                message: 'account not found',
                errorCode: errorCodes.ACCOUNT_NOT_FOUND
            });
            return;
        }

        const userPasswordHash = user.password
        const isMatch = await
            varifyHash(req?.body?.password, userPasswordHash)

        if (!isMatch) {
            res.status(401).send({
                message: 'invalid password',
                errorCode: errorCodes.INVALID_PASSWORD
            });
            return;
        }

        // Update email & email verified

        user.email = req?.body?.newEmail;
        user.isEmailVerified = false;
        await user.save();

        req.user = {
            isAdmin: currentUser?.isAdmin,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            email: req?.body?.newEmail,
            _id: currentUser?._id,
            profilePhoto: currentUser?.profilePhoto,
            gender: currentUser?.gender,
            dateOfBirth: currentUser?.dateOfBirth,
            createdOn: currentUser?.createdOn,
        }

        next()

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error please try later',
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        });
    }

}, issueLoginToken,
    (req, res, next) => {
        res.send({
            message: `email updated successfully 
            proceed to email verification`,
            errorCode: errorCodes.SUCCESS
        });
    }
)

// change password

router.put('/change-password', async (req, res, next) => {

    // parameters validation
    if (
        !req?.body?.newPassword ||
        !req?.body?.oldPassword
    ) {
        res.status(400).send({
            message: `required parameters missing, example request body:
                {
                    "newPassword": "XXXXXXXX",
                    "oldPassword": "XXXXXXXX"
                }`,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // verify new password pattern
    if (!passwordPattern.test(req?.body?.newPassword)) {
        res.status(400).send({
            errorCode: errorCodes.INVALID_PASSWORD,
            message: `new password must be between 6 to 20 characters and contain 
            at least one alphabet and one number`
        })
        return;
    }

    // getting current user
    const currentUser = req.currentUser

    // check is id valid
    if (!ObjectId.isValid(currentUser?._id)) {
        res.status(400).send({
            message: `invalid user id`,
            errorCode: errorCodes.INVALID_USER_ID
        });
        return;
    }

    try {

        // find user
        const user = await userModel
            .findById(new ObjectId(currentUser?._id)).exec();

        // if user not exists
        if (!user) {
            res.status(404).send({
                message: 'account not found',
                errorCode: errorCodes.ACCOUNT_NOT_FOUND
            });
            return;
        }

        // check old password
        const userPasswordHash = user.password
        const isMatch = await
            varifyHash(req?.body?.oldPassword, userPasswordHash)

        if (!isMatch) {
            res.status(401).send({
                message: 'invalid password',
                errorCode: errorCodes.INVALID_PASSWORD
            });
            return;
        }

        // generate new password hash
        const newPasswordHash = await stringToHash(req?.body?.newPassword);

        // Update user
        user.password = newPasswordHash;
        await user.save();

        // send a response
        res.send({
            message: "password updated successfully",
            errorCode: errorCodes.SUCCESS,
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error',
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        });
    }

})

// get user profile

router.get('/profile', async (req, res, next) => {

    const userId = req.currentUser?._id;

    // parameters validation
    if (!userId) {
        res.status(400).send({
            message: `required parameters missing, example request body:
                {
                    "userId": "XXXXXXXX"
                }`,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // check is id valid
    if (!ObjectId.isValid(userId)) {
        res.status(400).send({
            message: `invalid user id`,
            errorCode: errorCodes.INVALID_USER_ID
        });
        return;
    }

    // find user
    const user = await userModel
        .findById(new ObjectId(userId)).exec();

    // user not exists
    if (!user) {
        res.status(404).send({
            message: 'account not found',
            errorCode: errorCodes.ACCOUNT_NOT_FOUND
        });
        return;
    }

    // email not verified
    if (!user.isEmailVerified) {
        res.status(400).send({
            message: "email not verified",
            errorCode: errorCodes.EMAIL_NOT_VERIFIED
        });
        return;
    }

    // account disabled validation
    if (user.isDisabled) {
        res.status(401).send({
            message: "account is disabled",
            errorCode: errorCodes.ACCOUNT_DISABLED
        });
        return;
    }

    // account suspended validation
    if (user.isSuspended) {

        // clear harts from cookies
        res.clearCookie('hart');
        res.clearCookie('hartRef');

        res.status(401).send({
            message: "account is suspended",
            errorCode: errorCodes.ACCOUNT_SUSPENDED
        });

        return;
    }

    try {

        // send a response
        res.send({
            message: 'account founded',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                isAdmin: user.isAdmin,
                _id: user._id,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                createdOn: user.createdOn,
            },
            errorCode: errorCodes.SUCCESS
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error',
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        });
    }

})

// date of birth and gender api

router.put('/gender-and-dob', async (req, res, next) => {

    const userId = req.currentUser?._id;

    // parameters validation
    if (!userId || (!req?.body?.gender && !req?.body?.dateOfBirth)) {
        res.status(400).send({
            message: `required parameters missing, 
            example request body:
                {
                    "userId": "XXXXXXXX",
                    "gender": "male",
                    "dateOfBirth": "01/01/2000"
                }`,
            errorCode: errorCodes.REQUIRED_PARAMETER_MISSING
        })
        return;
    }

    // check is id valid
    if (!ObjectId.isValid(userId)) {
        res.status(400).send({
            message: `invalid user id`,
            errorCode: errorCodes.INVALID_USER_ID
        });
        return;
    }

    try {

        const currentUser = await userModel.
            findById(new ObjectId(userId))
            .exec();

        // user not found
        if (!currentUser) {
            res.status(404).send({
                message: 'account not found',
                errorCode: errorCodes.ACCOUNT_NOT_FOUND
            });
            return;
        }

        // update date of birth
        if (req?.body?.dateOfBirth) {
            currentUser.dateOfBirth = req?.body?.dateOfBirth
            await currentUser.save()
        }

        // update gender
        if (req?.body?.gender) {
            currentUser.gender = req?.body?.gender
            await currentUser.save()
        }

        req.user = {
            isAdmin: currentUser?.isAdmin,
            firstName: currentUser?.firstName,
            lastName: currentUser?.lastName,
            email: currentUser?.email,
            _id: currentUser?._id,
            profilePhoto: currentUser?.profilePhoto,
            gender: req?.body?.gender || currentUser?.gender,
            dateOfBirth: req?.body?.dateOfBirth || currentUser?.dateOfBirth,
            createdOn: currentUser?.createdOn,
        }

        next();

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error',
            errorCode: errorCodes.UNKNOWN_SERVER_ERROR
        });
    }

}, issueLoginToken,
    (req, res, next) => {
        res.send({
            message: 'profile updated successfully',
            errorCode: errorCodes.SUCCESS
        });
    }
)

export default router