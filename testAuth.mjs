import jwt from "jsonwebtoken"
import fs from "fs"
import "dotenv/config"

// a long list of your for your test cases running lik password email and others

const userData = {
    "_id": "090078601028347284843",
    "profilePhoto": null,
    "firstName": "Abdul",
    "lastName": "Ahad",
    "email": "user@gmail.com",
    "provider": "local",
    "isAdmin": true,
    "gender": null,
    "dateOfBirth": null,
    "createdOn": "2023-12-21T11:52:00.198Z"
}
export const mockToken = jwt.sign(userData, process.env.SECRET, { expiresIn: '1h' });
export const profileImg = fs.readFileSync("./rough/images/tree-3.jpg")
export const profileImgDest = 'tests/tree-3.jpg'
export const profileLargeImg = fs.readFileSync("./rough/images/2mb.jpg")
export const profileLargeImgDest = 'tests/2.jpg'