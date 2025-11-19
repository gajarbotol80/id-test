/* PROJECT: GAJARBOTOL ID FORGE ENGINE (REALISM EDITION)
   TYPE: Photorealistic Identity Document Generation
   DEPENDENCIES: @napi-rs/canvas
*/

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// --- 1. CONFIGURATION & ASSETS ---

// Register fonts (ensure these exist in your 'fonts' folder)
let fontsRegistered = false;
async function registerFonts() {
    if (fontsRegistered) return;
    try {
        const fontDir = path.join(process.cwd(), 'fonts');
        GlobalFonts.registerFromPath(path.join(fontDir, 'Arial.ttf'), 'Arial');
        GlobalFonts.registerFromPath(path.join(fontDir, 'RobotoMono-Regular.ttf'), 'Roboto Mono');
        GlobalFonts.registerFromPath(path.join(fontDir, 'Kalpurush.ttf'), 'Kalpurush'); // Bangla Font
        fontsRegistered = true;
    } catch (e) {
        console.warn("[SYSTEM] Font registration failed (using system defaults):", e.message);
    }
}

// --- 2. DATABASE (SAME AS BEFORE) ---
const COLLEGE_DB = [
    {
        name: "Dhaka College",
        bnName: "ঢাকা কলেজ",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Dhaka_College_Logo.svg/1200px-Dhaka_College_Logo.svg.png",
        primaryColor: "#800000", secondaryColor: "#FFD700",
        address: "Mirpur Road, Dhaka-1205", idFormat: "DC-24-#####", type: "govt"
    },
    {
        name: "North South University",
        bnName: "নর্থ সাউথ ইউনিভার্সিটি",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/North_South_University_Logo.svg/1200px-North_South_University_Logo.svg.png",
        primaryColor: "#003366", secondaryColor: "#FFFFFF",
        address: "Bashundhara, Dhaka-1229", idFormat: "241####042", type: "private"
    },
    {
        name: "Notre Dame College",
        bnName: "নটর ডেম কলেজ",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Notre_Dame_College_Dhaka_Monogram.svg/800px-Notre_Dame_College_Dhaka_Monogram.svg.png",
        primaryColor: "#00563F", secondaryColor: "#F1C40F",
        address: "Arambagh, Motijheel, Dhaka", idFormat: "324####", type: "govt"
    }
];

const BD_NAMES = {
    male: ["Tanvir", "Saiful", "Imran", "Rakib", "Hasan", "Abdullah", "Fahim", "Nayeem"],
    female: ["Nusrat", "Farjana", "Sadia", "Moumita", "Israt", "Jannatul", "Aysha"],
    surnames: ["Islam", "Hossain", "Ahmed", "Khan", "Rahman", "Chowdhury", "Ali", "Sarker"]
};

// --- 3. REALISM ENGINES ---

function addNoise(ctx, width, height, amount = 0.05) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount * 255;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
}

function drawHologram(ctx, x, y, size) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay'; // Blends nicely with underlying card
    ctx.globalAlpha = 0.6;

    // Create a rainbow gradient
    const grad = ctx.createLinearGradient(x, y, x + size, y + size);
    grad.addColorStop(0, 'rgba(255,0,0,0.5)');
    grad.addColorStop(0.2, 'rgba(255,255,0,0.5)');
    grad.addColorStop(0.4, 'rgba(0,255,0,0.5)');
    grad.addColorStop(0.6, 'rgba(0,255,255,0.5)');
    grad.addColorStop(0.8, 'rgba(0,0,255,0.5)');
    grad.addColorStop(1, 'rgba(255,0,255,0.5)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Add a "Seal" text inside
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("OFFICIAL", x + size/2, y + size/2 + 4);
    
    ctx.restore();
}

function addPlasticGlare(ctx, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen'; // Screen mode makes it look like light reflection
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)'); // Subtle bright streak
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.3)'); // Sharp reflection
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

function generateScratches(ctx, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    for(let i=0; i<15; i++) {
        ctx.beginPath();
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() * 50 - 25), y + (Math.random() * 50 - 25));
        ctx.stroke();
    }
    ctx.restore();
}

// --- 4. MAIN GENERATOR ---

export default async function handler(req, res) {
    await registerFonts();

    try {
        // --- A. GENERATE RAW CARD (CLEAN) ---
        const school = COLLEGE_DB[Math.floor(Math.random() * COLLEGE_DB.length)];
        const gender = Math.random() > 0.3 ? 'male' : 'female';
        const name = `${BD_NAMES[gender][Math.floor(Math.random() * BD_NAMES[gender].length)]} ${BD_NAMES.surnames[Math.floor(Math.random() * BD_NAMES.surnames.length)]}`;
        const idNum = school.idFormat.replace(/#/g, () => Math.floor(Math.random() * 10));

        const cardW = 600;
        const cardH = 380;
        const cardCanvas = createCanvas(cardW, cardH);
        const cCtx = cardCanvas.getContext('2d');

        // 1. Card Base
        cCtx.fillStyle = '#FFFFFF';
        cCtx.fillRect(0, 0, cardW, cardH);

        // 2. Watermark
        cCtx.save();
        cCtx.translate(cardW/2, cardH/2);
        cCtx.rotate(-Math.PI / 6);
        cCtx.font = 'bold 50px Arial';
        cCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        cCtx.textAlign = 'center';
        cCtx.fillText(school.name.toUpperCase(), 0, 0);
        cCtx.restore();

        // 3. Header
        cCtx.fillStyle = school.primaryColor;
        cCtx.beginPath();
        cCtx.moveTo(0, 0);
        cCtx.lineTo(cardW, 0);
        cCtx.lineTo(cardW, 100);
        cCtx.lineTo(0, 125); // Slightly more angle
        cCtx.fill();

        // 4. Assets (Logo + Photo)
        try {
            const logo = await loadImage(school.logoUrl);
            cCtx.drawImage(logo, cardW - 100, 20, 80, 80);
        } catch(e) {}

        const avatar = await loadImage('https://i.imgur.com/3g7nmJC.png'); // Replace with dynamic if available
        cCtx.fillStyle = '#E5E5E5';
        cCtx.fillRect(25, 135, 130, 160); // Photo frame
        cCtx.drawImage(avatar, 30, 140, 120, 150);

        // 5. Text Details
        cCtx.textAlign = 'left';
        
        // Header Text
        cCtx.fillStyle = '#FFFFFF';
        cCtx.font = 'bold 26px Arial';
        cCtx.fillText(school.name, 20, 50);
        cCtx.font = '18px Kalpurush'; // Bangla
        cCtx.fillStyle = '#E0E0E0';
        cCtx.fillText(school.bnName, 20, 80);

        // Body Text
        const lx = 180, vx = 280, ly = 165;
        const row = (label, val, y, isRed=false) => {
            cCtx.fillStyle = '#555';
            cCtx.font = '16px Arial';
            cCtx.fillText(label, lx, y);
            cCtx.fillStyle = isRed ? '#D00000' : '#000';
            cCtx.font = isRed ? 'bold 22px "Roboto Mono"' : 'bold 21px Arial';
            cCtx.fillText(val.toUpperCase(), vx, y);
        };

        row('Name:', name, ly);
        row('ID No:', idNum, ly + 35, true);
        row('Session:', '2024-2025', ly + 70);
        row('Program:', 'B.Sc in CSE', ly + 105);

        // 6. Footer
        cCtx.fillStyle = school.primaryColor;
        cCtx.fillRect(0, 350, cardW, 30);
        cCtx.fillStyle = '#FFF';
        cCtx.font = '11px Arial';
        cCtx.textAlign = 'center';
        cCtx.fillText('If found, please return to the registrar office.', cardW/2, 368);

        // 7. Apply Card-Level Effects (Hologram + Scratches)
        drawHologram(cCtx, cardW - 90, 260, 70); // Bottom right seal
        generateScratches(cCtx, cardW, cardH);

        // --- B. CREATE PHOTOREALISTIC SCENE (TABLETOP) ---
        
        // Create a larger canvas for the "Desk"
        const sceneW = 800;
        const sceneH = 600;
        const scene = createCanvas(sceneW, sceneH);
        const ctx = scene.getContext('2d');

        // 1. Draw Desk Background (Dark Wood/Matte Table texture)
        ctx.fillStyle = '#222222'; // Dark grey matte desk
        ctx.fillRect(0, 0, sceneW, sceneH);
        
        // Add noise to desk
        addNoise(ctx, sceneW, sceneH, 0.08);

        // 2. Calculate Position (Centered but rotated)
        const cx = sceneW / 2;
        const cy = sceneH / 2;
        const rotation = (Math.random() * 0.1) - 0.05; // Subtle rotation (-0.05 to +0.05 rad)

        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.translate(-cardW/2, -cardH/2); // Center the card in the coordinate system

        // 3. Realistic Drop Shadow
        // We draw a black rect blurred under the card
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20; // Soft shadow
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 15; // Light source from top-left
        ctx.fillRect(5, 5, cardW - 10, cardH - 10); // Slightly smaller rect for shadow
        ctx.restore();

        // 4. Place the Generated Card
        ctx.drawImage(cardCanvas, 0, 0);

        // 5. Global Lighting / Glare (Plastic Sheen)
        // This goes OVER the card to simulate light hitting the plastic sleeve
        const sheenGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
        sheenGrad.addColorStop(0, 'rgba(255,255,255,0)');
        sheenGrad.addColorStop(0.4, 'rgba(255,255,255,0)');
        sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)'); // Faint reflection line
        sheenGrad.addColorStop(0.6, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(0, 0, cardW, cardH);

        // 6. Final Camera Vignette (Darken corners of the whole photo)
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for full screen overlay
        const vignette = ctx.createRadialGradient(sceneW/2, sceneH/2, sceneH/3, sceneW/2, sceneH/2, sceneW/1.2);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, sceneW, sceneH);

        // 7. Final Sensor Noise (ISO Grain)
        addNoise(ctx, sceneW, sceneH, 0.04);

        // Output
        const buffer = await scene.encode('jpeg', { quality: 85 }); // JPEG compression adds to realism
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Engine Failure");
    }
}
