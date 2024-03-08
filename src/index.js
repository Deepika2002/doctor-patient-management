const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { Admin, Patient, Doctor, Suggestion, PatientData } = require("./mongodb"); // Update the import

const app = express();
const templatePath = path.join(__dirname, '../templates');
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});

// Render the login page
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/doctor-login", (req, res) => {
    res.render("doctor-login");
});

app.get("/patient-login", (req, res) => {
    res.render("patient-login");
});

// Render the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Render the doctor signup page
app.get("/doctor-signup", (req, res) => {
    res.render("doctor-signup");
});

// Render the patient signup page
app.get("/patient-signup", (req, res) => {
    res.render("patient-signup");
});

// POST route for admin signup
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    };

    try {
        // Create a new document using the Mongoose model for admin signup
        const newAdmin = new Admin(data);
        await newAdmin.save();
        console.log("Admin signed up and created successfully");
        res.render("home"); // Render home page after successful signup
    } catch (error) {
        console.error("Error signing up and creating admin:", error);
        res.status(500).send("Error signing up and creating admin");
    }
});

// POST route for patient signup
app.post("/patient-signup", async (req, res) => {
    const { name, password, age, gender, condition } = req.body;

    try {
        // Create a new document using the Mongoose model for patient signup
        const newPatient = new Patient({ name, password, age, gender, condition });
        await newPatient.save();
        console.log("Patient signed up and created successfully");
        res.redirect(`/patient-home/${newPatient._id}`); 
    } catch (error) {
        console.error("Error signing up and creating patient:", error);
        res.status(500).send("Error signing up and creating patient");
    }
});


// POST route for doctor signup
app.post("/doctor-signup", async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    };

    try {
        // Create a new document using the Mongoose model for doctor signup
        const newDoctor = new Doctor(data);
        await newDoctor.save();
        console.log("Doctor signed up and created successfully");
        res.render("doctor-home"); // Render doctor home page after successful signup
    } catch (error) {
        console.error("Error signing up and creating doctor:", error);
        res.status(500).send("Error signing up and creating doctor");
    }
});

// POST route for admin login
app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await Admin.findOne({ name });

        if (!user || user.password !== password) {
            throw new Error("Invalid credentials");
        }

        res.render("home");
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(401).send("Invalid credentials");
    }
});

// POST route for patient login
app.post("/patient-login", async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log("Patient login attempt:", name, password); // Log received data

        const patient = await Patient.findOne({ name });

        if (!patient || patient.password !== password) {
            throw new Error("Invalid credentials");
        }

        res.redirect(`/patient-home/${patient._id}`);
    } catch (error) {
        console.error("Error logging in as patient:", error);
        res.status(401).send("Invalid credentials");
    }
});

// Route handler for adding values to a patient's data
app.get('/api/:id/values', async (req, res) => {
    try {
        const patientId = req.params.id;
        const { value1, value2, value3, value4 } = req.query;


        // Fetch existing patient data or create a new one if not exists
        let patientData = await PatientData.findOne({ patientId });
        if (!patientData) {
            patientData = new PatientData({ patientId, values: [] });
        }

        // Add the new values to the patient data
        patientData.values.push({ value1, value2, value3, value4 });
        await patientData.save();

        // Redirect back to patient home page after saving values
        res.redirect(`/patient-home/${patientId}`);
    } catch (error) {
        console.error("Error adding values:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route handler for patient home page
app.get('/patient-home/:id', async (req, res) => {
    try {
        const patientId = req.params.id;

        // Fetch patient details from the database based on the ObjectId
        const patientDetails = await Patient.findById(patientId);
        if (!patientDetails) {
            throw new Error("Patient not found");
        }

        // Fetch suggestions for the patient
        const suggestions = await Suggestion.find({ patientId });

        // Fetch patient data for the patient
        const patientData = await PatientData.findOne({ patientId });

        res.render("patient-home", { patient: patientDetails, suggestions, patientData });
    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST route for doctor login
app.post("/doctor-login", async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log("Doctor login attempt:", name, password); // Log received data

        const doctor = await Doctor.findOne({ name });

        if (!doctor || doctor.password !== password) {
            throw new Error("Invalid credentials");
        }

        res.redirect(`/doctor-home/${doctor._id}`);
    } catch (error) {
        console.error("Error logging in as doctor:", error);
        res.status(401).send("Invalid credentials");
    }
});


app.get('/doctor-home/:id', async (req, res) => {
    try {
        // Fetch doctor details from the database based on the ObjectId
        const doctorId = req.params.id;
        const doctorDetails = await Doctor.findById(doctorId);

        if (!doctorDetails) {
            throw new Error("Doctor not found");
        }

        // Fetch all patients from the database
        const patients = await Patient.find();

        // Render the doctor home page template with the fetched doctor details and patients
        res.render("doctor-home", { doctor: doctorDetails, pats: patients });
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/find-patient-details', async (req, res) => {
    try {
        const patientId = req.query.patientId;
        // Redirect the doctor to the patient details page with the selected patient's ID
        res.redirect(`/patient-details/${patientId}`);
    } catch (error) {
        console.error("Error finding patient details:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/find-patient-details', async (req, res) => {
    try {
        const patientId = req.body.patientId;
        // Redirect to the patient details page with the selected patient's ID
        res.redirect(`/patient-details/${patientId}`);
    } catch (error) {
        console.error("Error finding patient details:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/patient-details/:id', async (req, res) => {
    try {
        const patientId = req.params.id; 

        // Fetch patient details from the database based on the ObjectId
        const patientDetails = await Patient.findById(patientId);

        // Fetch patient data from the database based on the ObjectId
        const patientData = await PatientData.findOne({ patientId });
        console.log(patientData);

        if (!patientDetails) {
            throw new Error("Patient not found");
        }

        // Render the patient details page template with the fetched patient details and patient data
        res.render("patient-details", { patient: patientDetails, patientData });
    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).send("Internal Server Error");
    }
});




// Route to serve patient registration form
app.get("/patient-register", (req, res) => {
    res.render("patient-registration");
});


// POST route for patient registration
app.post("/patient-register", async (req, res) => {
    const { name, password } = req.body;
    try {
        const newPatient = new Patient({ name, password });
        await newPatient.save();
        console.log("Patient registered successfully");
        res.render("patient-home", { patient: newPatient }); // Redirect to patient home page after registration
    } catch (error) {
        console.error("Error registering patient:", error);
        res.status(500).send("Error registering patient");
    }
});


app.post('/submit-suggestion', async (req, res) => {
    try {
        const { patientId, suggestion } = req.query;

        // Log the submitted form data
        console.log("Submitted Form Data:");
        console.log("Patient ID:", patientId);
        console.log("Suggestion:", suggestion);

        // Save the suggestion to the database
        const newSuggestion = new Suggestion({ patientId, suggestion });
        await newSuggestion.save();


    } catch (error) {
        console.error("Error submitting suggestion:", error);
        res.status(500).send("Internal Server Error");
    }
});




// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
