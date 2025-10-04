require("dotenv").config();
console.log("PRIVATE_KEY Loaded:", process.env.PRIVATE_KEY ? "YES: " + process.env.PRIVATE_KEY.substring(0,10) + "..." : "NO");
console.log("SEPOLIA_RPC_URL Loaded:", process.env.SEPOLIA_RPC_URL ? "YES" : "NO");