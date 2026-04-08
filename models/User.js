const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
   schoolId: { type: String, unique: true },
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   age: { type: Number, required: true },
   role: { type: String, required: true },
   department: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function () {
    
    if (this.isNew) {
        const lastUser = await mongoose.model('User').findOne({}, 'schoolId').sort({ schoolId: -1 });
        
        let nextId = 1111;
        
        if (lastUser && lastUser.schoolId) {
            nextId = parseInt(lastUser.schoolId, 10) + 11;
        }
        
        // Convert to string to save in the database
        this.schoolId = nextId.toString();
    }

    // 2. PASSWORD HASHING
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);