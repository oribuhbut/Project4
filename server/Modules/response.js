module.exports = {
success:Boolean,
message:String,
data:Array,
setResponse(success,message,data){
    this.success = success;
    this.message = message;
    this.data = data;
},
getResponse(){
    this.success,
    this.message,
    this.data
    return this;
}
}