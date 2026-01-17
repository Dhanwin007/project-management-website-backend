const asyncHandler = (requestHandler)=> {
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))//next(err) jumps to the next function here it passes the control on to the error middleware having
        //(err,req,res,next) has params
    }
}

export {asyncHandler}
//using .then and .catch would be much easier to understand so look this once
/**const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // We execute the function first, then handle the resulting Promise
        requestHandler(req, res, next)
            .then(() => {}) // We don't usually need to do anything in .then
            .catch((err) => next(err));
    };
};*/
