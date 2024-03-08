const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }
},{collection: 'admins'});

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    age: Number,
    gender: String,
    condition: String,
}, { collection: 'patients' });


const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }
}, { collection: 'doctors' });

const suggestionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    suggestion: String
});

const patientDataSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    values: [{ value1: String, value2: String, value3: String, value4: String }]
});

const PatientData = mongoose.model('PatientData', patientDataSchema);


const Admin = mongoose.model("Admin", AdminSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Suggestion = mongoose.model('Suggestion', suggestionSchema);

module.exports = {
    Admin,
    Patient,
    Doctor,
    Suggestion,
    PatientData
};
