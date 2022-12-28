// Importieren von express und express-validator
import express from 'express';
import { body, validationResult } from 'express-validator';
import fs from "fs";

// Konstante für den Port festlegen
const PORT = 9999;

// Erstellen einer neuen Express-Anwendung
const app = express();

// EJS-Engine aktivieren
app.set('view engine', 'ejs');

// Statische Dateien im Ordner "public" verfügbar machen
app.use(express.static("./public"));

// Aktivieren des Empfangs von Formulardaten
app.use(express.urlencoded({ extended: true }));

// Leeres Array für spätere Benutzereinträge
let guestInput = [];

// GET-Route für den Pfad "/" definieren
app.get("/", (_, res) => {
    // EJS-Template "guestbook" rendern und das guestInput-Array sowie das errors-Objekt übergeben
    res.render("guestbook", { postings: guestInput, errors: null });
});

// POST-Route für den Pfad "/posting" definieren
app.post("/posting",
    // Anfragevalidierung durchführen
    body('name').isLength({ min: 1, max: 40 }),
    body('email').isEmail(),
    (req, res) => {
        // console.log(req.body);

        // Ergebnis der Validierung abrufen
        const errors = validationResult(req);

        // Wenn die Validierung fehlgeschlagen ist, das Template erneut rendern und das errors-Objekt übergeben
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.render('guestbook', { postings: guestInput, errors });
        }
       
        fs.readFile('./public/data.json', (err, data) => {

            // Überprüfe, ob beim Lesen der Datei ein Fehler aufgetreten ist
            if (err) console.log(err);

            // Wandle den Inhalt der Datei in ein JavaScript-Objekt um
            guestInput = JSON.parse(data);

            // Füge ein neues Element zum guestInput-Array hinzu, das aus den im req.body-Objekt enthaltenen Daten erstellt wurde
            guestInput.push({ name: req.body.name, email: req.body.email, textInput: req.body.textarea });

            // Schreibe den geänderten Inhalt von guestInput in die ursprüngliche Datei
            fs.writeFile('./public/data.json', JSON.stringify(guestInput), (err) => {
                // Überprüfe, ob beim Schreiben der Datei ein Fehler aufgetreten ist
                if (err) console.log(err);

                // Render die HTML-Seite, die das Gästebuch darstellt, erneut und übergebe die postings- und errors-Variablen dem Template
                res.render('guestbook', { postings: guestInput, errors: null });
            });
        });
    });

// HTTP-Server auf dem angegebenen Port starten und Meldung im Terminal ausgeben
app.listen(PORT, () => {
    console.log('Server läuft auf PORT:', PORT);
});
