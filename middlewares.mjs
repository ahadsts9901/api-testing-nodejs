import jwt from 'jsonwebtoken';
import "dotenv/config"
import { extendedSessionInDays, initialSessionInDays } from './schema.mjs';

// generate harts middleware

export const issueLoginToken = (req, res, next) => {

    const { isAdmin, firstName, lastName, email,
        _id, profilePhoto, gender, dateOfBirth,
        createdOn } = req.user;

    // hartRef

    const hartRef = jwt.sign({
        isAdmin: isAdmin,
        firstName: firstName,
        lastName: lastName,
        email: email,
        _id: _id,
        profilePhoto: profilePhoto,
        gender: gender,
        dateOfBirth: dateOfBirth,
        createdOn: createdOn
    }, process.env.SECRET, {
        expiresIn: `${extendedSessionInDays}d`
    });

    res.cookie('hartRef', hartRef, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + extendedSessionInDays * 24 * 60 * 60 * 1000)
    });

    // hart

    const hart = jwt.sign({
        isAdmin: isAdmin,
        firstName: firstName,
        lastName: lastName,
        email: email,
        _id: _id,
        profilePhoto: profilePhoto,
        gender: gender,
        dateOfBirth: dateOfBirth,
        createdOn: createdOn
    }, process.env.SECRET, {
        expiresIn: `${initialSessionInDays}d`
    });

    res.cookie('hart', hart, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + initialSessionInDays * 24 * 60 * 60 * 1000)
    });

    next()

}