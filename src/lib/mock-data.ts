import { Category, Game, Item, PaymentMethod, PromoCode, Transaction } from "@/db/schema";

export const initialCategories: Category[] = [
  { id: "cat-mobile", name: "Mobile Games", slug: "mobile-games", icon: "Smartphone", createdAt: new Date() },
  { id: "cat-pc", name: "PC Games", slug: "pc-games", icon: "Monitor", createdAt: new Date() },
  { id: "cat-voucher", name: "Voucher & Gift Card", slug: "voucher", icon: "Gift", createdAt: new Date() },
  { id: "cat-app", name: "Entertainment / Apps", slug: "apps", icon: "Tv", createdAt: new Date() },
];

export const initialGames: Game[] = [
    {
      id: "game-mlbb",
      name: "Mobile Legends: Bang Bang",
      slug: "mobile-legends",
      categoryId: "cat-mobile",
      developer: "Moonton",
      description: "Top up Diamond Mobile Legends resmi, cepat, dan murah. Proses instan 1-3 detik langsung masuk ke akun Mobile Legends kamu.",
      thumbnailUrl: "/images/games/mlbb.png",
      bannerUrl: "/images/games/mlbb.png",
      accountInputs: {
        userId: true,
        userLabel: "User ID",
        userPlaceholder: "Contoh: 123456789",
        zoneId: true,
        zoneLabel: "Zone ID",
        zonePlaceholder: "Contoh: 2105",
        helperText: "Untuk mengetahui User ID Anda, buka profil game di pojok kiri atas. User ID tertera di bawah foto profil (format: 123456789 (2105)).",
      },
      hasServerCheck: true,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-ff",
      name: "Free Fire",
      slug: "free-fire",
      categoryId: "cat-mobile",
      developer: "Garena",
      description: "Beli Diamond Free Fire murah & instan. Dukung push rank Booyah kamu sekarang juga tanpa ribet!",
      thumbnailUrl: "/images/games/ff.png",
      bannerUrl: "/images/games/ff.png",
      accountInputs: {
        userId: true,
        userLabel: "Player ID",
        userPlaceholder: "Contoh: 87654321",
        helperText: "Untuk mengetahui Player ID Anda, klik avatar Anda di sudut kiri atas layar utama Free Fire.",
      },
      hasServerCheck: true,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-genshin",
      name: "Genshin Impact",
      slug: "genshin-impact",
      categoryId: "cat-mobile",
      developer: "HoYoverse",
      description: "Top up Genesis Crystals & Blessing of the Welkin Moon resmi melalui HoYoverse UID. Instan dan aman 100%.",
      thumbnailUrl: "/images/games/genshin-impact.png",
      bannerUrl: "/images/games/genshin-impact.png",
      accountInputs: {
        userId: true,
        userLabel: "UID Genshin Impact",
        userPlaceholder: "Contoh: 801234567",
        serverList: [
          { label: "Asia", value: "os_asia" },
          { label: "America", value: "os_usa" },
          { label: "Europe", value: "os_euro" },
          { label: "TW, HK, MO", value: "os_cht" },
        ],
        helperText: "UID dapat dilihat pada pojok kanan bawah layar game atau di menu Paimon.",
      },
      hasServerCheck: true,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-valorant",
      name: "Valorant",
      slug: "valorant",
      categoryId: "cat-pc",
      developer: "Riot Games",
      description: "Beli Valorant Points (VP) resmi Riot Games Indonesia. Buka Skin Vandal & Phantom idamanmu sekarang!",
      thumbnailUrl: "/images/games/valorant.png",
      bannerUrl: "/images/games/valorant.png",
      accountInputs: {
        userId: true,
        userLabel: "Riot ID",
        userPlaceholder: "Contoh: Player#ID1",
        helperText: "Masukkan Riot ID lengkap beserta Tagline (#TAG).",
      },
      hasServerCheck: true,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-codm",
      name: "Call of Duty: Mobile",
      slug: "call-of-duty-mobile",
      categoryId: "cat-mobile",
      developer: "Activision",
      description: "Top up CP (Call of Duty Points) resmi untuk Call of Duty Mobile. Dapatkan skin senjata, karakter, dan Battle Pass eksklusif.",
      thumbnailUrl: "/images/games/codm.png",
      bannerUrl: "/images/games/codm.png",
      accountInputs: {
        userId: true,
        userLabel: "Player ID",
        userPlaceholder: "Contoh: 8765432109",
        helperText: "Masukkan Player ID lengkap (angka saja, tanpa simbol).",
      },
      hasServerCheck: true,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-roblox",
      name: "Roblox",
      slug: "roblox",
      categoryId: "cat-mobile",
      developer: "Roblox Corporation",
      description: "Beli Robux resmi Roblox. Gunakan Robux untuk membeli item avatar, akses premium, dan fitur eksklusif di Roblox.",
      thumbnailUrl: "/images/games/roblox.png",
      bannerUrl: "/images/games/steam.png",
      accountInputs: {
        userId: true,
        userLabel: "Username Roblox",
        userPlaceholder: "Contoh: PlayerName123",
        helperText: "Masukkan username Roblox Anda (bukan display name).",
      },
      hasServerCheck: false,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-minecraft",
      name: "Minecraft",
      slug: "minecraft",
      categoryId: "cat-voucher",
      developer: "Mojang Studios",
      description: "Beli Minecraft Java Edition atau Bedrock Edition resmi. Akses semua fitur premium dan update terbaru.",
      thumbnailUrl: "/images/games/minecraft.png",
      bannerUrl: "/images/games/minecraft.png",
      accountInputs: {
        userId: true,
        userLabel: "Email / Username",
        userPlaceholder: "Contoh: gamer@email.com",
        helperText: "Masukkan email atau username akun Minecraft Anda.",
      },
      hasServerCheck: false,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-pubgm",
      name: "PUBG Mobile",
      slug: "pubg-mobile",
      categoryId: "cat-mobile",
      developer: "Level Infinite",
      description: "Top up UC PUBG Mobile resmi dan termurah. Buka Royale Pass dan upgrade skin senjata eksklusif.",
      thumbnailUrl: "/images/games/pubgm.png",
      bannerUrl: "/images/games/pubgm.png",
      accountInputs: {
        userId: true,
        userLabel: "Player ID",
        userPlaceholder: "Contoh: 512345678",
        helperText: "Buka profil di pojok kiri atas lobi, ID tertera di bawah nama akun.",
      },
      hasServerCheck: true,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "game-steam",
      name: "Steam Wallet Code (IDR)",
      slug: "steam-wallet",
      categoryId: "cat-voucher",
      developer: "Valve",
      description: "Beli Voucher Steam Wallet Rupiah resmi. Kode voucher langsung dikirimkan ke WhatsApp & Email kamu.",
      thumbnailUrl: "/images/games/steam.png",
      bannerUrl: "/images/games/steam.png",
      accountInputs: {
        userId: true,
        userLabel: "Nomor WhatsApp / Akun",
        userPlaceholder: "Contoh: 081234567890",
        helperText: "Kode voucher akan dikirimkan otomatis ke kontak WhatsApp Anda.",
      },
      hasServerCheck: false,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
    },
];

export const initialItems: Item[] = [
  // Mobile Legends
  { id: "item-ml-wdp", gameId: "game-mlbb", name: "Weekly Diamond Pass", code: "ML_WDP", price: 27500, originalPrice: 32000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_wdp_icon.png", isPromo: true, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-ml-86", gameId: "game-mlbb", name: "86 Diamonds (78 + 8 Bonus)", code: "ML_86", price: 21500, originalPrice: 24000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_86_icon.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-ml-172", gameId: "game-mlbb", name: "172 Diamonds (156 + 16 Bonus)", code: "ML_172", price: 42500, originalPrice: 48000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_172_icon.png", isPromo: false, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-ml-257", gameId: "game-mlbb", name: "257 Diamonds (234 + 23 Bonus)", code: "ML_257", price: 63500, originalPrice: 72000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_257_icon.png", isPromo: true, sortOrder: 4, isActive: true, createdAt: new Date() },
  { id: "item-ml-706", gameId: "game-mlbb", name: "706 Diamonds (625 + 81 Bonus)", code: "ML_706", price: 172000, originalPrice: 195000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_706_icon.png", isPromo: false, sortOrder: 5, isActive: true, createdAt: new Date() },
  { id: "item-ml-2195", gameId: "game-mlbb", name: "2195 Diamonds (1860 + 335 Bonus)", code: "ML_2195", price: 519000, originalPrice: 580000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_2195_icon.png", isPromo: false, sortOrder: 6, isActive: true, createdAt: new Date() },
  { id: "item-ml-twilight", gameId: "game-mlbb", name: "Twilight Pass", code: "ML_TWILIGHT", price: 145000, originalPrice: 160000, iconUrl: "https://wacdn.mlbb.com/image/mlbb_twilight_icon.png", isPromo: false, sortOrder: 7, isActive: true, createdAt: new Date() },

  // Free Fire
  { id: "item-ff-70", gameId: "game-ff", name: "70 Diamonds", code: "FF_70", price: 9500, originalPrice: 12000, iconUrl: "https://d1j1u4tjg8uq8g.cloudfront.net/ff_70_icon.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-ff-140", gameId: "game-ff", name: "140 Diamonds", code: "FF_140", price: 19000, originalPrice: 22000, iconUrl: "https://d1j1u4tjg8uq8g.cloudfront.net/ff_140_icon.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-ff-355", gameId: "game-ff", name: "355 Diamonds", code: "FF_355", price: 47000, originalPrice: 55000, iconUrl: "https://d1j1u4tjg8uq8g.cloudfront.net/ff_355_icon.png", isPromo: true, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-ff-720", gameId: "game-ff", name: "720 Diamonds", code: "FF_720", price: 94000, originalPrice: 110000, iconUrl: "https://d1j1u4tjg8uq8g.cloudfront.net/ff_720_icon.png", isPromo: false, sortOrder: 4, isActive: true, createdAt: new Date() },
  { id: "item-ff-member-week", gameId: "game-ff", name: "Membership Mingguan", code: "FF_MWEEK", price: 29000, originalPrice: 35000, iconUrl: "https://d1j1u4tjg8uq8g.cloudfront.net/ff_member_icon.png", isPromo: true, sortOrder: 5, isActive: true, createdAt: new Date() },

  // Genshin Impact
  { id: "item-gi-welkin", gameId: "game-genshin", name: "Blessing of the Welkin Moon", code: "GI_WELKIN", price: 79000, originalPrice: 85000, iconUrl: "https://webstatic.mihoyo.com/icon/Genshin_Welkin_Moon.png", isPromo: true, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-gi-60", gameId: "game-genshin", name: "60 Genesis Crystals", code: "GI_60", price: 15500, originalPrice: 18000, iconUrl: "https://webstatic.mihoyo.com/icon/Genshin_60_Crystals.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-gi-300", gameId: "game-genshin", name: "300 + 30 Genesis Crystals", code: "GI_300", price: 74000, originalPrice: 82000, iconUrl: "https://webstatic.mihoyo.com/icon/Genshin_300_Crystals.png", isPromo: false, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-gi-980", gameId: "game-genshin", name: "980 + 110 Genesis Crystals", code: "GI_980", price: 235000, originalPrice: 260000, iconUrl: "https://webstatic.mihoyo.com/icon/Genshin_980_Crystals.png", isPromo: false, sortOrder: 4, isActive: true, createdAt: new Date() },
  { id: "item-gi-1980", gameId: "game-genshin", name: "1980 + 260 Genesis Crystals", code: "GI_1980", price: 470000, originalPrice: 510000, iconUrl: "https://webstatic.mihoyo.com/icon/Genshin_1980_Crystals.png", isPromo: false, sortOrder: 5, isActive: true, createdAt: new Date() },

  // Valorant
  { id: "item-val-475", gameId: "game-valorant", name: "475 Valorant Points", code: "VAL_475", price: 54000, originalPrice: 60000, iconUrl: "https://media.valorantpoint.com/icon/valorant_points_475.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-val-1000", gameId: "game-valorant", name: "1000 Valorant Points", code: "VAL_1000", price: 108000, originalPrice: 120000, iconUrl: "https://media.valorantpoint.com/icon/valorant_points_1000.png", isPromo: true, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-val-2050", gameId: "game-valorant", name: "2050 Valorant Points", code: "VAL_2050", price: 215000, originalPrice: 240000, iconUrl: "https://media.valorantpoint.com/icon/valorant_points_2050.png", isPromo: false, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-val-3650", gameId: "game-valorant", name: "3650 Valorant Points", code: "VAL_3650", price: 375000, originalPrice: 420000, iconUrl: "https://media.valorantpoint.com/icon/valorant_points_3650.png", isPromo: false, sortOrder: 4, isActive: true, createdAt: new Date() },

  // PUBG Mobile
  { id: "item-pubg-60", gameId: "game-pubgm", name: "60 UC", code: "PUBG_60", price: 14000, originalPrice: 16000, iconUrl: "https://static.pubg.com/icon/pubg_uc_60.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-pubg-325", gameId: "game-pubgm", name: "325 UC", code: "PUBG_325", price: 69000, originalPrice: 77000, iconUrl: "https://static.pubg.com/icon/pubg_uc_325.png", isPromo: true, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-pubg-660", gameId: "game-pubgm", name: "660 UC", code: "PUBG_660", price: 139000, originalPrice: 155000, iconUrl: "https://static.pubg.com/icon/pubg_uc_660.png", isPromo: false, sortOrder: 3, isActive: true, createdAt: new Date() },

  // Call of Duty Mobile
  { id: "item-codm-80", gameId: "game-codm", name: "80 Call of Duty Points", code: "CODM_80", price: 12000, originalPrice: 14000, iconUrl: "https://media.valorantpoint.com/icon/codm_80_points.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-codm-420", gameId: "game-codm", name: "420 Call of Duty Points", code: "CODM_420", price: 62000, originalPrice: 70000, iconUrl: "https://media.valorantpoint.com/icon/codm_420_points.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-codm-840", gameId: "game-codm", name: "840 Call of Duty Points", code: "CODM_840", price: 125000, originalPrice: 140000, iconUrl: "https://media.valorantpoint.com/icon/codm_840_points.png", isPromo: true, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-codm-1680", gameId: "game-codm", name: "1,680 Call of Duty Points", code: "CODM_1680", price: 249000, originalPrice: 280000, iconUrl: "https://media.valorantpoint.com/icon/codm_1680_points.png", isPromo: false, sortOrder: 4, isActive: true, createdAt: new Date() },
  { id: "item-codm-4200", gameId: "game-codm", name: "4,200 Call of Duty Points", code: "CODM_4200", price: 620000, originalPrice: 690000, iconUrl: "https://media.valorantpoint.com/icon/codm_4200_points.png", isPromo: true, sortOrder: 5, isActive: true, createdAt: new Date() },

  // Roblox
  { id: "item-rob-100", gameId: "game-roblox", name: "100 Robux", code: "ROB_100", price: 15000, originalPrice: 18000, iconUrl: "https://shared.fastly.steamstatic.com/icon/roblox_100_robux.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-rob-500", gameId: "game-roblox", name: "500 Robux", code: "ROB_500", price: 75000, originalPrice: 85000, iconUrl: "https://shared.fastly.steamstatic.com/icon/roblox_500_robux.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-rob-1000", gameId: "game-roblox", name: "1,000 Robux", code: "ROB_1000", price: 149000, originalPrice: 168000, iconUrl: "https://shared.fastly.steamstatic.com/icon/roblox_1000_robux.png", isPromo: true, sortOrder: 3, isActive: true, createdAt: new Date() },
  { id: "item-rob-2200", gameId: "game-roblox", name: "2,200 Robux", code: "ROB_2200", price: 329000, originalPrice: 368000, iconUrl: "https://shared.fastly.steamstatic.com/icon/roblox_2200_robux.png", isPromo: false, sortOrder: 4, isActive: true, createdAt: new Date() },

  // Minecraft
  { id: "item-mc-java", gameId: "game-minecraft", name: "Minecraft Java Edition", code: "MC_JAVA", price: 349000, originalPrice: 399000, iconUrl: "https://wacdn.mlbb.com/image/minecraft_java_icon.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-mc-bedrock", gameId: "game-minecraft", name: "Minecraft Bedrock Edition", code: "MC_BEDROCK", price: 449000, originalPrice: 499000, iconUrl: "https://wacdn.mlbb.com/image/minecraft_bedrock_icon.png", isPromo: true, sortOrder: 2, isActive: true, createdAt: new Date() },

  // Steam Wallet
  { id: "item-steam-45k", gameId: "game-steam", name: "Steam Wallet IDR 45.000", code: "STEAM_45K", price: 47500, originalPrice: 50000, iconUrl: "https://shared.fastly.steamstatic.com/icon/steam_wallet_45k.png", isPromo: false, sortOrder: 1, isActive: true, createdAt: new Date() },
  { id: "item-steam-90k", gameId: "game-steam", name: "Steam Wallet IDR 90.000", code: "STEAM_90K", price: 94000, originalPrice: 100000, iconUrl: "https://shared.fastly.steamstatic.com/icon/steam_wallet_90k.png", isPromo: false, sortOrder: 2, isActive: true, createdAt: new Date() },
  { id: "item-steam-250k", gameId: "game-steam", name: "Steam Wallet IDR 250.000", code: "STEAM_250K", price: 259000, originalPrice: 275000, iconUrl: "https://shared.fastly.steamstatic.com/icon/steam_wallet_250k.png", isPromo: true, sortOrder: 3, isActive: true, createdAt: new Date() },
];

export const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "pay-qris",
    code: "QRIS",
    name: "QRIS Realtime (Semua E-Wallet & M-Banking)",
    type: "QRIS",
    feeFlat: 0,
    feePercentage: "0.70",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
    accountNumber: "00020101021226580014ID.LINKAJA.WWW01189360091100000000005204581253033605802ID5910RXR_STORE6007JAKARTA61051234062070703A016304",
    instructions: [
      "Buka aplikasi E-Wallet (GoPay, DANA, OVO, ShopeePay) atau Mobile Banking favorit Anda.",
      "Pilih menu 'Scan' atau 'Bayar dengan QR'.",
      "Arahkan kamera ke Kode QRIS di halaman pembayaran.",
      "Periksa nominal pembayaran dan selesaikan transaksi dengan memasukkan PIN.",
      "Pembayaran akan terverifikasi otomatis dalam 1-5 detik.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-dana",
    code: "DANA",
    name: "DANA",
    type: "EWALLET",
    feeFlat: 1000,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
    accountNumber: "081234567890",
    instructions: [
      "Buka aplikasi DANA di smartphone Anda.",
      "Lakukan transfer ke nomor Virtual Akun/Merchant DANA yang tertera.",
      "Konfirmasi nominal pembayaran dan masukkan PIN DANA Anda.",
      "Pesanan akan diproses otomatis begitu pembayaran diterima.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-gopay",
    code: "GOPAY",
    name: "GoPay",
    type: "EWALLET",
    feeFlat: 1000,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/6/65/Gopay_logo_%282019%29.svg",
    accountNumber: "081234567890",
    instructions: [
      "Buka aplikasi Gojek / GoPay.",
      "Klik Bayar dan scan kode atau transfer ke merchant RXR.",
      "Pastikan saldo mencukupi dan selesaikan pembayaran dengan PIN.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-bca-va",
    code: "BCA_VA",
    name: "BCA Virtual Account",
    type: "VA",
    feeFlat: 2500,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
    accountNumber: "8077708123456789",
    instructions: [
      "Buka BCA mobile (m-BCA) atau KlikBCA.",
      "Pilih menu m-Transfer > BCA Virtual Account.",
      "Masukkan nomor Virtual Account yang tertera pada invoice.",
      "Periksa rincian pembayaran, lalu masukkan PIN m-BCA Anda.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-mandiri-va",
    code: "MANDIRI_VA",
    name: "Mandiri Virtual Account",
    type: "VA",
    feeFlat: 2500,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
    accountNumber: "8890808123456789",
    instructions: [
      "Buka aplikasi Livin' by Mandiri.",
      "Pilih menu Bayar > Multi Payment.",
      "Pilih penyedia jasa atau masukkan Kode Perusahaan / VA.",
      "Konfirmasi transaksi dan masukkan PIN Livin'.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-bri-va",
    code: "BRI_VA",
    name: "BRI Virtual Account (BRIVA)",
    type: "VA",
    feeFlat: 2500,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg",
    accountNumber: "1280008123456789",
    instructions: [
      "Buka aplikasi BRImo.",
      "Pilih menu Pembayaran > BRIVA.",
      "Masukkan nomor BRIVA yang tertera pada invoice.",
      "Periksa tagihan dan masukkan PIN BRImo.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pay-alfamart",
    code: "ALFAMART",
    name: "Alfamart / Alfamidi",
    type: "RETAIL",
    feeFlat: 3500,
    feePercentage: "0.00",
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg",
    accountNumber: "ALFA-901823719",
    instructions: [
      "Kunjungi gerai Alfamart terdekat.",
      "Sampaikan kepada kasir ingin melakukan pembayaran tagihan merchant 'RXR'.",
      "Tunjukkan kode pembayaran yang tertera pada invoice.",
      "Bayar sesuai nominal ke kasir dan simpan struk pembayaran.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
];

export const initialPromoCodes: PromoCode[] = [
  {
    id: "promo-1",
    code: "RXRHEMAT",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscount: 15000,
    minPurchase: 20000,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "promo-2",
    code: "NEONBARU",
    discountType: "FLAT",
    discountValue: 5000,
    maxDiscount: 5000,
    minPurchase: 25000,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "promo-3",
    code: "SULTANVIP",
    discountType: "PERCENTAGE",
    discountValue: 15,
    maxDiscount: 30000,
    minPurchase: 100000,
    isActive: true,
    createdAt: new Date(),
  },
];

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const TX_FILE = path.join(DATA_DIR, "transactions.json");

const sampleTransactions: Transaction[] = [
  {
    id: "tx-sample-1",
    invoiceNumber: "TPY-SAMPLE-001",
    gameId: "game-mlbb",
    gameName: "Mobile Legends: Bang Bang",
    itemId: "item-ml-86",
    itemName: "86 Diamonds (78 + 8 Bonus)",
    paymentMethodId: "pay-qris",
    paymentMethodName: "QRIS Realtime",
    accountData: { userId: "12345678", zoneId: "2105", nickname: "Mythic_Slayer99" },
    customerPhone: "081234567890",
    customerEmail: "gamer@example.com",
    subtotal: 21500,
    fee: 151,
    discount: 2150,
    totalAmount: 19501,
    status: "SUCCESS",
    paymentDetails: {
      qrString: "0002010102122658...",
      expiredAt: new Date(Date.now() + 86400000).toISOString(),
      paidAt: new Date().toISOString(),
    },
    notes: "Transaksi sukses via QRIS",
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3500000),
  },
];

// In-memory runtime store with file persistence for demo mode
export class MemoryStore {
  static categories: Category[] = [...initialCategories];
  static games: Game[] = [...initialGames];
  static items: Item[] = [...initialItems];
  static paymentMethods: PaymentMethod[] = [...initialPaymentMethods];
  static promoCodes: PromoCode[] = [...initialPromoCodes];

  static getTransactions(): Transaction[] {
    try {
      if (typeof window === "undefined" && fs.existsSync(TX_FILE)) {
        const raw = fs.readFileSync(TX_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return sampleTransactions;
  }

  static saveTransaction(tx: Transaction) {
    const list = this.getTransactions();
    const existingIndex = list.findIndex(
      (t) => t.invoiceNumber.toUpperCase() === tx.invoiceNumber.toUpperCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = tx;
    } else {
      list.unshift(tx);
    }
    try {
      if (typeof window === "undefined") {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(TX_FILE, JSON.stringify(list, null, 2), "utf-8");
      }
    } catch {
      // ignore
    }
  }
}

