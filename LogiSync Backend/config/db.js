var mongoose = require('mongoose');

const connect = async () => {
    try {
        console.log(`Connecting to database ${process.env.MONGO_URI}`);
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to ${db.connection.host}`);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connect;