import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCurrentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const configs = {
  acricolor: {
    api_url: "https://db.sofmar.com.py:4008/api/",
    db: "acricolor",
    version: "1.2.4",
    title: "Acricolor",
  },
  lobeck: {
    api_url: "https://node.sofmar.com.py:4009/api/",
    db: "lobeck",
    version: "1.2.4",
    title: "Lobeck",
  },
  distriwembe: {
    api_url: "https://node.sofmar.com.py:4020/api/",
    db: "distriwembe",
    version: "1.2.4",
    title: "Distriwembe",
  },
  concrecar: {
    api_url: "https://node.sofmar.com.py:4007/api/",
    db: "concrecar",
    version: "1.2.4",
    title: "Concrecar",
  },
  bodega: {
    api_url: "https://node.sofmar.com.py:4021/api/",
    db: "bodega",
    version: "1.2.4",
    title: "Bodega",
  },
  truckdiesel: {
    api_url: "https://node.sofmar.com.py:4022/api/",
    db: "truckdiesel",
    version: "1.2.4",
    title: "Truckdiesel",
  },
  campomax: {
    api_url: "https://node.sofmar.com.py:4023/api/",
    db: "campomax",
    version: "1.2.4",
    title: "Campomax",
  },
  gaesa: {
    api_url: "https://node.gaesa.com.py:8080/api/",
    db: "gaesa",
    version: "1.2.4",
    title: "Gaesa",
  },
  gaesademo: {
    api_url: "https://node.sofmar.com.py:4024/api/",
    db: "gaesademo",
    version: "1.2.4",
    title: "Gaesa Demo",
  },
  lamberty: {
    api_url: "https://node.sofmar.com.py:4025/api/",
    db: "lamberty",
    version: "1.2.4",
    title: "Lamberty",
  },
  local: {
    api_url: "https://localhost:4024/api/",
    db: "local",
    version: "1.2.4",
    title: "Local",
  },
  rustimemo: {
    api_url: "https://node.sofmar.com.py:4026/api/",
    db: "rustimemo",
    version: "1.2.4",
    title: "Rustimemo",
  },
  buda: {
    api_url: "https://node.sofmar.com.py:4027/api/",
    db: "buda",
    version: "1.2.4",
    title: "Buda",
  },
  zimer: {
    api_url: "https://node.sofmar.com.py:4001/api/",
    db: "zimer",
    version: "1.2.4",
    title: "Zimmer",
  },

  mersan: {
    api_url: "https://node.sofmar.com.py:4005/api/",
    db: "mersan",
    version: "1.2.4",
    title: "Mersan",
  },
  
  agrosertaneja: {
    api_url: "https://node.sofmar.com.py:4006/api/",
    db: "agrosertaneja",
    version: "1.2.4",
    title: "Agrosertaneja",
  },
  caofa: {
    api_url: "https://backend.caofa.com.py:4000/api/",
    db: "caofa",
    version: "1.2.4",
    title: "Caofa",
  },
  ferrehanh: {
    api_url: "https://node.sofmar.com.py:4028/api/",
    db: "ferrehanh",
    version: "1.2.4",
    title: "Ferrehanh",
  },
  medical: {
    api_url: "https://node.sofmar.com.py:4029/api/",
    db: "medical",
    version: "1.2.4",
    title: "Medical",
  },
};

async function updateConfig(empresa) {
  if (!configs[empresa]) {
    console.error(
      `Error: La empresa "${empresa}" no existe en la configuración`
    );
    process.exit(1);
  }

  const configPath = path.join(__dirname, "../src/utils.ts");
  const indexPath = path.join(__dirname, "../index.html");

  try {
    let content = fs.readFileSync(configPath, "utf8");
    const config = configs[empresa];
    const currentDate = getCurrentDate();

    content = content.replace(
      /export const\s+api_url\s*=\s*'[^']*'/,
      `export const api_url = '${config.api_url}'`
    );

    content = content.replace(
      /export const\s+db\s*=\s*'[^']*'/,
      `export const db = '${config.db}'`
    );

    content = content.replace(
      /export const\s+version\s*=\s*'[^']*'/,
      `export const version = '${config.version}'`
    );

    content = content.replace(
      /export const\s+fechaRelease\s*=\s*'[^']*'/,
      `export const fechaRelease = '${currentDate}'`
    );

    fs.writeFileSync(configPath, content, "utf8");

    // Actualizar index.html
    let indexContent = fs.readFileSync(indexPath, "utf8");
    indexContent = indexContent.replace(
      /<title>.*?<\/title>/,
      `<title>${config.title}</title>`
    );
    fs.writeFileSync(indexPath, indexContent, "utf8");

    console.log(`✅ Configuración actualizada exitosamente para ${empresa}`);
    console.log("Valores actualizados:");
    console.log(`- API URL: ${config.api_url}`);
    console.log(`- DB: ${config.db}`);
    console.log(`- Versión: ${config.version}`);
    console.log(`- Fecha Release: ${currentDate}`);
    console.log(`- Título: ${config.title}`);

  } catch (error) {
    console.error("❌ Error en el proceso:", error.message);
    process.exit(1);
  }
}

const company = process.argv[2];

if (!company) {
  console.error("❌ Error: Por favor especifica una compañía");
  console.log("Uso: node updateConfig.js [nombre-compañia]");
  console.log("Compañías disponibles:", Object.keys(configs).join(", "));
  process.exit(1);
}

updateConfig(company);
