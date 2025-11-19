/* PROJECT: GAJARBOTOL ID FORGE ENGINE (BD EDITION) - VERCEL API
   TYPE: Serverless Image Generation
   DEPENDENCIES: @napi-rs/canvas
   DEPLOYMENT: Vercel / AWS Lambda
*/

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// --- 1. BANGLADESHI IDENTITY DATABASE ---

const BD_NAMES = {
    male: [
        "Mohammad", "Mehedi", "Tanvir", "Saiful", "Imran", "Rakib", 
        "Hasan", "Abdullah", "Masud", "Sohel", "Arif", "Rifat", 
        "Fahim", "Nayeem", "Shakil", "Tamim", "Sabbir"
    ],
    female: [
        "Nusrat", "Farjana", "Sumaiya", "Sadia", "Tanjina", "Moumita", 
        "Israt", "Jannatul", "Fatema", "Aysha", "Sharmin", "Nadia", 
        "Rubina", "Shamima", "Purnima", "Riya"
    ],
    surnames: [
        "Islam", "Hossain", "Ahmed", "Khan", "Rahman", "Chowdhury", 
        "Hasan", "Ali", "Uddin", "Sarker", "Akter", "Begum", 
        "Majumder", "Sikder", "Miah", "Sheikh", "Bhowmik", "Das"
    ]
};

// --- 2. REAL COLLEGE DATABASE ---

const COLLEGE_DB = [
    {
        name: "Dhaka College",
        bnName: "ঢাকা কলেজ",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Dhaka_College_Logo.svg/1200px-Dhaka_College_Logo.svg.png",
        primaryColor: "#800000", // Maroon
        secondaryColor: "#FFD700", // Gold
        address: "Mirpur Road, Dhaka-1205",
        idFormat: "DC-24-#####", // Batch 24
        type: "govt"
    },
    {
        name: "North South University",
        bnName: "নর্থ সাউথ ইউনিভার্সিটি",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/North_South_University_Logo.svg/1200px-North_South_University_Logo.svg.png",
        primaryColor: "#003366", // NSU Blue
        secondaryColor: "#FFFFFF",
        address: "Bashundhara, Dhaka-1229",
        idFormat: "241####042", // NSU 10 digit format
        type: "private"
    },
    {
        name: "Notre Dame College",
        bnName: "নটর ডেম কলেজ",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Notre_Dame_College_Dhaka_Monogram.svg/800px-Notre_Dame_College_Dhaka_Monogram.svg.png",
        primaryColor: "#00563F", // NDC Green
        secondaryColor: "#F1C40F", // Yellow/Cream
        address: "Arambagh, Motijheel, Dhaka",
        idFormat: "324####", // Group + Roll
        type: "govt"
    },
    {
        name: "BRAC University",
        bnName: "ব্র্যাক ইউনিভার্সিটি",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Brac_University_logo.png/220px-Brac_University_logo.png",
        primaryColor: "#253494", // BRAC Blue
        secondaryColor: "#999999", // Silver
        address: "66 Mohakhali, Dhaka-1212",
        idFormat: "24101###",
        type: "private"
    }
];

// --- 3. UTILITIES ---

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateBdIdentity() {
    const gender = Math.random() > 0.3 ? 'male' : 'female'; 
    const first = getRandomElement(BD_NAMES[gender]);
    const last = getRandomElement(BD_NAMES.surnames);
    
    return {
        name: `${first} ${last}`,
        gender: gender,
        dob: `199${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 11) + 1}-${Math.floor(Math.random() * 28) + 1}`
    };
}

function generateIdNumber(format) {
    return format.replace(/#/g, () => Math.floor(Math.random() * 10));
}

function applyScanEffect(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 20;
        data[i] += grain + 5;     
        data[i+1] += grain;       
        data[i+2] += grain - 5;   
    }
    ctx.putImageData(imageData, 0, 0);
}

// Ensure fonts are registered only once globally
let fontsRegistered = false;

async function registerAllFonts() {
    if (fontsRegistered) return;

    try {
        // Register Arial (or a suitable sans-serif replacement)
        GlobalFonts.registerFromPath(path.join(process.cwd(), 'fonts', 'Arial.ttf'), 'Arial');
        // Register a monospace font
        GlobalFonts.registerFromPath(path.join(process.cwd(), 'fonts', 'RobotoMono-Regular.ttf'), 'Roboto Mono');
        // Register a Bangla font (e.g., Kalpurush, Noto Sans Bengali)
        GlobalFonts.registerFromPath(path.join(process.cwd(), 'fonts', 'Kalpurush.ttf'), 'Kalpurush');
        
        console.log("[FONTS] All custom fonts registered.");
        fontsRegistered = true;
    } catch (error) {
        console.error("[FONTS] Error registering fonts:", error);
        // Fallback to generic if custom fonts fail to load
        console.warn("[FONTS] Falling back to generic system fonts.");
    }
}


// --- 4. SERVERLESS HANDLER ---

export default async function handler(req, res) {
    try {
        // Register fonts on every invocation, but prevent duplicate registration
        await registerAllFonts();

        // 1. Setup
        const school = getRandomElement(COLLEGE_DB);
        const identity = generateBdIdentity();
        const idNumber = generateIdNumber(school.idFormat);

        const width = 600;
        const height = 380;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        console.log(`[API LOG] Generating ID for ${identity.name} at ${school.name}`);

        // 2. Background Layer
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Watermark (School Name Faded)
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(-Math.PI / 6);
        ctx.font = 'bold 50px Arial'; // Using registered Arial
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.textAlign = 'center';
        ctx.fillText(school.name.toUpperCase(), 0, 0);
        ctx.restore();

        // 3. Header Design
        ctx.fillStyle = school.primaryColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, 100);
        ctx.lineTo(0, 120);
        ctx.closePath();
        ctx.fill();

        // 4. Logos & Images
        try {
            const logo = await loadImage(school.logoUrl);
            ctx.drawImage(logo, width - 110, 20, 80, 80);
        } catch (e) {
            console.error('Logo load failed:', e.message);
        }

        // Avatar
        const avatarUrl = 'https://i.imgur.com/3g7nmJC.png'; 
        const avatar = await loadImage(avatarUrl);
        
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(25, 135, 130, 160); 
        ctx.drawImage(avatar, 30, 140, 120, 150); 

        // 5. Text Information
        
        // School Name (English + Bangla)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px Arial'; // Using registered Arial
        ctx.textAlign = 'left';
        ctx.fillText(school.name, 20, 50);
        
        ctx.font = '18px Kalpurush'; // Using registered Bangla font
        ctx.fillStyle = '#EEEEEE';
        ctx.fillText(school.bnName, 20, 80); // Display Bangla name here

        // Student Details
        const labelX = 180;
        const valueX = 280;
        let currentY = 160;
        const lineHeight = 35;

        ctx.textAlign = 'left';
        
        // Name
        ctx.fillStyle = '#555555';
        ctx.font = '16px Arial'; // Using registered Arial
        ctx.fillText('Name:', labelX, currentY);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Arial'; // Using registered Arial
        ctx.fillText(identity.name.toUpperCase(), valueX, currentY);
        
        currentY += lineHeight;

        // ID No
        ctx.fillStyle = '#555555';
        ctx.font = '16px Arial'; // Using registered Arial
        ctx.fillText('ID No:', labelX, currentY);
        ctx.fillStyle = '#D00000'; 
        ctx.font = 'bold 22px "Roboto Mono"'; // Using registered monospace font
        ctx.fillText(idNumber, valueX, currentY);

        currentY += lineHeight;

        // Session/Year
        ctx.fillStyle = '#555555';
        ctx.font = '16px Arial'; // Using registered Arial
        ctx.fillText('Session:', labelX, currentY);
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial'; // Using registered Arial
        ctx.fillText('2024-2025', valueX, currentY);

        currentY += lineHeight;

        // Program
        const programs = school.type === 'govt' ? ['H.S.C (Science)', 'H.S.C (Business)', 'B.A (Honours)'] : ['B.Sc in CSE', 'BBA', 'EEE'];
        const program = getRandomElement(programs);
        
        ctx.fillStyle = '#555555';
        ctx.font = '16px Arial'; // Using registered Arial
        ctx.fillText('Program:', labelX, currentY);
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial'; // Using registered Arial
        ctx.fillText(program, valueX, currentY);

        // 6. Footer / Barcode
        ctx.fillStyle = school.primaryColor;
        ctx.fillRect(0, 350, width, 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = '12px Arial'; // Using registered Arial
        ctx.fillText('This card is non-transferable. Return to address above if found.', width/2, 370);

        // 7. Final Rendering
        applyScanEffect(ctx, width, height);

        // 8. Response Logic
        const buffer = await canvas.encode('jpeg', { quality: 90 });
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-store, max-age=0'); 
        res.send(buffer);

    } catch (error) {
        console.error("Generator Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
