import { Router } from "express";
import personsRouter from "./persons";

const router = Router({
  caseSensitive : true,
  strict        : true,
});

router.use('/person', personsRouter);

export default router;