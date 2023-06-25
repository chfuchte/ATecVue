import { Db, ObjectId } from "mongodb";
import IEvent from "./event";
import { Router } from "express";

export default function viewEvents(db: Db): Router {
  const router = Router();

  const eventCollection = db.collection<IEvent>("events");

  router.get('/event/:id', async (req, res) => {
    try {
      if (!req.auth?.authenticated) {
        res.status(401).send("Unauthorized");
        return;
      }

      // check if the user is logged in and at least a user (not locked)
      if (!req.auth?.user || req.auth?.user.permissionLevel === "locked") {
        res.status(403).send("Forbidden");
        return;
      }

      const eventId = req.params.id;

      try {
        const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
        if (event) {
          res.send(event);
        } else {
          res.status(404).send("Event not found");
        }
      } catch (error) {
        console.error("Error retrieving event:", error);
        res.status(500).send("Internal Server Error");
      }
    } catch (error) {
      console.error("Error retrieving event:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // get all events, sorted by date and in a short format
  router.get('/events', async (req, res) => {
    try {
      if (!req.auth?.authenticated) {
        res.status(401).send("Unauthorized");
        return;
      }

      // check if the user is logged in and at least a user (not locked)
      if (!req.auth?.user || req.auth?.user.permissionLevel === "locked") {
        res.status(403).send("Forbidden");
        return;
      }

      try {
        const events = await eventCollection
          .find()
          .map(event => {
            return {
              _id: event._id,
              title: event.title,
              description: event.description,
              start: event.start,
              end: event.end,
              location: event.location,
              notes: event.notes,
            };
          })
          .sort({ date: 1 })
          .toArray();
        res.send(events);
      } catch (error) {
        console.error("Error retrieving events:", error);
        res.status(500).send("Internal Server Error");
      }
    } catch (error) {
      console.error("Error retrieving events:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
}
