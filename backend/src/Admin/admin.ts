import { Db, ObjectId } from "mongodb";
import IUser from "../Auth/user";
import { Router } from "express";
import { hash } from "bcrypt";

// return a router with the event create route
export default function createEvent(db: Db): Router {

    const router = Router();

    const userCollection = db.collection<IUser>("users");

    router.post("/user", async (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).send("Unauthorized");
            return;
        }

        // check if the user is logged in and at least a admin (not locked, not user)
        if (!req.user || req.user.permissionLevel != "admin") {
            res.status(403).send("Unauthorized");
            return;
        }

        // check if the request body is valid
        if (!validateBody(req.body)) {
            res.status(400).send("Bad Request");
            return;
        }

        req.body.password = await hash(req.body.password, 10)

        // insert the user into the database
        const result = await userCollection.insertOne({
            username: req.body.username,
            password: req.body.password,
            permissionLevel: req.body.permissionLevel,
            contactAdress: req.body.contactAdress,
            dId: req.body.dId,
        });

        // send the result
        res.status(200).send(result.insertedId);
    });

    // route to update a user
    router.patch("/user", async (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).send("Unauthorized");
            return;
        }

        // check if the user is logged in and at least a admin
        if (!req.user || req.user.permissionLevel != "admin") {
            res.status(403).send("Unauthorized");
            return;
        }

        // check if the request body is valid
        if (!validatePatchBody(req.body)) {
            res.status(400).send("Bad Request");
            return;
        }

        if (req.body.password) req.body.password = await hash(req.body.password, 10)

        // update the user in the database
        const result = await userCollection.updateOne(
            { _id: ObjectId.createFromHexString(req.body._id) },
            {
                $set: {
                    password: req.body.password,
                    permissionLevel: req.body.permissionLevel,
                    contactAdress: req.body.contactAdress,
                    dId: req.body.dId,
                },
            }
        );

        if (result.acknowledged) {
            res.status(200).send(true);
        } else {
            res.status(500).send(false);
        }
    });

    return router;
}


function validateBody(body: any): body is IUser {
    if (!body) return false;
    if (!body.username || !body.password || !body.permissionLevel || !body.contactAdress) return false;
    if (typeof body.username !== "string" || typeof body.password !== "string" || typeof body.permissionLevel !== "string" || typeof body.contactAdress !== "string") return false;
    if (body.permissionLevel !== "locked" && body.permissionLevel !== "user" && body.permissionLevel !== "technician" && body.permissionLevel !== "admin") return false;
    if (body.dId !== undefined && typeof body.dId !== "string") return false;
    return true;
}

interface IUserPatch {
    _id: string;
    username?: string;
    password?: string;
    permissionLevel?: "locked" | "user" | "technician" | "admin";
    contactAdress?: string;
    dId?: string;
}

function validatePatchBody(body: any): body is IUserPatch {
    if (!body._id) return false;
    if (!ObjectId.isValid(body._id)) return false;
    return true;
}