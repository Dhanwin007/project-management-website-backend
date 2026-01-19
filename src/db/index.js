import mongoose from 'mongoose';
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongodb successfully connected');
  } catch (error) {
    console.error('😋Mongodb connection error', error);
    process.exit(1);
  }
}
/*main().then(()=>{console.log("connected successfully");})
.catch((err)=>{
    console.error("connection failed",err);
    process.exit(1);
})*/
export default main;
