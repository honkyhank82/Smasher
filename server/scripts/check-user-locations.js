"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
});
async function checkUserLocations() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected\n');
        const profiles = await AppDataSource.query(`
      SELECT 
        u.id as user_id,
        u.email,
        p.display_name,
        p.lat,
        p.lng,
        CASE 
          WHEN p.lat IS NULL OR p.lng IS NULL THEN '❌ NO LOCATION'
          ELSE '✅ HAS LOCATION'
        END as status
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 20;
    `);
        console.log('📍 User Location Status:\n');
        console.table(profiles);
        const stats = await AppDataSource.query(`
      SELECT 
        COUNT(*) FILTER (WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL) as with_location,
        COUNT(*) FILTER (WHERE p.lat IS NULL OR p.lng IS NULL) as without_location,
        COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id;
    `);
        console.log('\n📊 Statistics:');
        console.table(stats);
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
checkUserLocations();
//# sourceMappingURL=check-user-locations.js.map