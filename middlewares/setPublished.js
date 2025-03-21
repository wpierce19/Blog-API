const setPublished = (req, res, next) => {
    req.published = true;
    next();
}

export default setPublished;