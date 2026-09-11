// PM2 ecosystem — paksa IPv4 agar request VIPayment keluar lewat IP yang di-whitelist.
// Cara pakai di VPS: pm2 delete rxr; pm2 start ecosystem.config.cjs; pm2 save
module.exports = {
  apps: [
    {
      name: "rxr",
      script: "bun",
      args: "run start -- --port 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        // Penting: tanpa ini Node bisa keluar lewat IPv6 (tidak di-whitelist VIPayment)
        NODE_OPTIONS: "--dns-result-order=ipv4first",
      },
    },
  ],
};
