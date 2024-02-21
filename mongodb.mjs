import mongoose from 'mongoose';
import "dotenv/config"

const uri = process.env.MONGO_URI

async function run() {
    try {
        await mongoose.connect(uri, {
            dbName: 'ai-tiles',
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false // Add this line
        });
    } catch (err) {
        console.log("Mongodb connection error", err);
        process.exit(1);
    }
}

run().catch(console.dir);


mongoose.connection.on('connected', function () {
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', async function () {
    console.log("app is terminating");
    await mongoose.connection.close();

    console.log('Mongoose default connection closed');
    process.exit(0);

});