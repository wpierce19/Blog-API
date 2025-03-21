import {PrismaClient} from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const getPosts = asyncHandler(async (req,res) => {
    let condition = {};
    if (req.user.role != 'ADMIN') condition.author_id = req.user_id;
    if (req.published) condition.published = true;
    const posts = await prisma.post.findMany({
        where: condition,
        include: {author: true},
    });
    res.send(posts);
});

const getPostById = asyncHandler(async (req,res) => {
    const { postId } = req.params;
    let condition = {};
    if (req.user.role != 'ADMIN') condition.author_id = req.user_id;
    if (req.published) condition.published = true;
    const uniquePost = await prisma.post.findUnique({
        where: {...condition, id: parseInt(postId)},
        include: {comments: true, author: true},

    });
    if (!uniquePost) return res.sendStatus(404);
    return res.send(uniquePost);
});

const createPost = asyncHandler(async (req,res) => {
    const {title, content, published} = req.body;
    const data = {title: title, content: content, author_id: req.user.id};
    if (published) data.published = true;
    const newPost = await prisma.post.create({data});
    res.send(newPost);
});

const updatePost = asyncHandler(async (req,res) => {
    const {title, content, published} = req.body;
    const data = {};
    if (title && content){
        data.title = title;
        data.content = content;
    }
    if (published) data.published = true;

    const updatePost = await prisma.post.update({
        where: {
            id: parseInt(req.params.postId),
            author_id: req.user.id,
        },
        data,
    });
    res.send(updatePost);
});

const deletePost = asyncHandler(async (req,res) => {
    let condition = {};
    if (req.user.role != 'ADMIN') condition.author_id = req.user.id;
    const deletedPost = await prisma.post.delete({
        where: {
            id: parseInt(req.params.postId),
            ...condition,
        },
    });
    if (!deletedPost) return res.sendStatus(404);
    res.send(deletedPost);

});

const createComment = asyncHandler(async (req,res) => {
    const createdComment = await prisma.comment.create({
        data: {
            author_name: req.body.name,
            author_email: req.body.email,
            text: req.body.text,
            post_id: parseInt(req.params.postId),
        },
    });
    res.send(createdComment);
});

const deleteComment = asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: parseInt(req.params.commentId),
        },
        include: {
            post: true,
        },
    });

    if (req.user.role != 'ADMIN' || comment.post.author_id == req.user.id){
        const comment = await prisma.comment.delete({
            where: {
                id: parseInt(req.params.commentId),
            },
        });
        return res.send(comment);
    }
    res.sendStatus(403);
})

export default {
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    createPost,
    createComment,
    deleteComment,
};

