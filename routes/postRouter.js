import {Router} from "express";
import postController from "../controllers/postController.js";
import setPublished from "../middlewares/setPublished.js";

const postRouter = Router();

postRouter.get("/", postController.getPosts);
postRouter.get("/published", setPublished, postController.getPosts);

postRouter.get("/:postId", postController.getPostById);
postRouter.get("/published/:postId", setPublished, postController.getPostById);

postRouter.post("/", postController.createPost);
postRouter.put("/:postId", postController.updatePost);
postRouter.delete("/:postId", postController.deletePost);

postRouter.post("/:postId/comments", postController.createComment);
postRouter.delete("/comments/:commentId", postController.deleteComment);

export default postRouter;