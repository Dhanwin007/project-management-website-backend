class ApiError extends Error{
    constructor(
       statusCode,
       message="Something went wrong" ,
       errors=[],
       stack=""//not always avalaible;error stack i.e., the error trace like in java
        
    )
    {
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)

            
        }
    }
}
export {ApiError};