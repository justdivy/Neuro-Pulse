const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true 
}, // e.g., 25MCI10161
  name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  password: { 
    type: String, 
    required: true 
}, // In a real app, we would encrypt this!
  institution: { 
    type: String, 
    default: "Chandigarh University, Mohali" 
},
  dob: { type: String, 
    default: "2002" 
},
});

module.exports = mongoose.model("User", userSchema);
