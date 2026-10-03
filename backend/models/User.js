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
  institution: { type: String, trim: true },
  dateOfBirth: { type: String, trim: true },
  // Retained for existing documents created before dateOfBirth was introduced.
  dob: { type: String, trim: true },
});

module.exports = mongoose.model("User", userSchema);
