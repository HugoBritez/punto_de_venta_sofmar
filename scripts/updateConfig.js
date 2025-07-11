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
    api_url_secondary: "https://node.sofmar.com.py:5008/api/",
    db: "acricolor",
    version: "1.2.4",
    title: "Acricolor",
  },
  lobeck: {
    api_url: "https://node.sofmar.com.py:4009/api/",
    api_url_secondary: "https://node.sofmar.com.py:5009/api/",
    db: "lobeck",
    version: "1.2.4",
    title: "Lobeck",
  },
  distriwembe: {
    api_url: "https://node.sofmar.com.py:4020/api/",
    api_url_secondary: "https://node.sofmar.com.py:5020/api/",
    db: "distriwembe",
    version: "1.2.4",
    title: "Distriwembe",
  },
  concrecar: {
    api_url: "https://node.sofmar.com.py:4007/api/",
    api_url_secondary: "https://node.sofmar.com.py:5007/api/",
    db: "concrecar",
    version: "1.2.4",
    title: "Concrecar",
  },
  bodega: {
    api_url: "https://node.sofmar.com.py:4021/api/",
    api_url_secondary: "https://node.sofmar.com.py:5021/api/",
    db: "bodega",
    version: "1.2.4",
    title: "Bodega",
  },
  truckdiesel: {
    api_url: "https://node.sofmar.com.py:4022/api/",
    api_url_secondary: "https://node.sofmar.com.py:5022/api/",
    db: "truckdiesel",
    version: "1.2.4",
    title: "Truckdiesel",
  },
  campomax: {
    api_url: "https://node.sofmar.com.py:4023/api/",
    api_url_secondary: "https://node.sofmar.com.py:5023/api/",
    db: "campomax",
    version: "1.2.4",
    title: "Campomax",
  },
  gaesa: {
    api_url: "https://node.gaesa.com.py:8080/api/",
    api_url_secondary: "https://node.gaesa.com.py:8081/api/",
    db: "gaesa",
    version: "1.2.4",
    title: "Gaesa",
  },
  gaesademo: {
    api_url: "https://node.sofmar.com.py:4024/api/",
    api_url_secondary: "https://node.sofmar.com.py:5024/api/",
    db: "gaesademo",
    version: "1.2.4",
    title: "Gaesa Demo",
  },
  lamberty: {
    api_url: "https://node.sofmar.com.py:4025/api/",
    api_url_secondary: "https://node.sofmar.com.py:5025/api/",
    db: "lamberty",
    version: "1.2.4",
    title: "Lamberty",
  },
  local: {
    api_url: "http://localhost:4000/api/",
    api_url_secondary: "https://localhost:4024/api/",
    db: "local",
    version: "1.2.4",
    title: "Sofmar",
  },
  rustimemo: {
    api_url: "https://node.sofmar.com.py:4026/api/",
    api_url_secondary: "https://node.sofmar.com.py:5026/api/",
    db: "rustimemo",
    version: "1.2.4",
    title: "Rustimemo",
  },
  buda: {
    api_url: "https://node.sofmar.com.py:4027/api/",
    api_url_secondary: "https://node.sofmar.com.py:5027/api/",
    db: "buda",
    version: "1.2.4",
    title: "Buda",
  },
  zimer: {
    api_url: "https://node.sofmar.com.py:4001/api/",
    api_url_secondary: "https://node.sofmar.com.py:5001/api/",
    db: "zimer",
    version: "1.2.4",
    title: "Zimmer",
  },
  mersan: {
    api_url: "https://node.sofmar.com.py:4005/api/",
    api_url_secondary: "https://node.sofmar.com.py:5005/api/",
    db: "mersan",
    version: "1.2.4",
    title: "Mersan",
  },
  agrosertaneja: {
    api_url: "https://node.sofmar.com.py:4006/api/",
    api_url_secondary: "https://node.sofmar.com.py:5006/api/",
    db: "agrosertaneja",
    version: "1.2.4",
    title: "Agrosertaneja",
  },
  caofa: {
    api_url: "https://backend.caofa.com.py:4000/api/",
    api_url_secondary: "https://backend.caofa.com.py:5000/api/",
    db: "caofa",
    version: "1.2.4",
    title: "Caofa",
  },
  ferrehanh: {
    api_url: "https://node.sofmar.com.py:4028/api/",
    api_url_secondary: "https://node.sofmar.com.py:5028/api/",
    db: "ferrehanh",
    version: "1.2.4",
    title: "Ferrehanh",
  },
  medical: {
    api_url: "https://node.sofmar.com.py:4029/api/",
    api_url_secondary: "https://node.sofmar.com.py:5029/api/",
    db: "medical",
    version: "1.2.4",
    title: "Medical",
  },
  kardan: {
    api_url: "https://node.sofmar.com.py:4030/api/",
    api_url_secondary: "https://node.sofmar.com.py:5030/api/",
    db: "kardan",
    version: "1.2.4",
    title: "Kardan",
  },
  samaria: {
    api_url: "https://node.sofmar.com.py:4032/api/",
    api_url_secondary: "https://node.sofmar.com.py:5032/api/",
    db: "samaria",
    version: "1.2.4",
    title: "Samaria",
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
  const expresApiUrlPath = path.join(__dirname, "../src/shared/consts/expres_api_url.ts");
  const dotnetApiUrlPath = path.join(__dirname, "../src/shared/consts/dotnet_api_url.ts");
  const envDevPath = path.join(__dirname, "../.env.development");

  try {
    let content = fs.readFileSync(configPath, "utf8");
    const config = configs[empresa];
    const currentDate = getCurrentDate();

    content = content.replace(
      /export const\s+api_url\s*=\s*'[^']*'/,
      `export const api_url = '${config.api_url}'`
    );

    // Agregar o actualizar api_url_secondary
    if (content.includes('export const api_url_secondary')) {
      content = content.replace(
        /export const\s+api_url_secondary\s*=\s*'[^']*'/,
        `export const api_url_secondary = '${config.api_url_secondary}'`
      );
    } else {
      // Insertar después de la primera api_url
      content = content.replace(
        /export const\s+api_url\s*=\s*'[^']*'/,
        `export const api_url = '${config.api_url}'\n\nexport const api_url_secondary = '${config.api_url_secondary}'`
      );
    }

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

    // Actualizar dotnet_api_url.ts
    let dotnetApiUrlContent = fs.readFileSync(dotnetApiUrlPath, "utf8");
    if (dotnetApiUrlContent.trim() === "") {
      // Si el archivo está vacío, crear el contenido
      dotnetApiUrlContent = `export const dotnet_api_url = "${config.api_url_secondary}";`;
    } else {
      // Si ya tiene contenido, actualizar la variable existente
      dotnetApiUrlContent = dotnetApiUrlContent.replace(
        /export const\s+dotnet_api_url\s*=\s*"[^"]*"/,
        `export const dotnet_api_url = "${config.api_url_secondary}"`
      );
    }
    fs.writeFileSync(dotnetApiUrlPath, dotnetApiUrlContent, "utf8");

    // Actualizar .env.development con api_url_secondary
    let envDevContent = "";
    try {
      envDevContent = fs.readFileSync(envDevPath, "utf8");
    } catch (error) {
      // Si el archivo .env.development no existe, lo creamos con el formato correcto
      envDevContent = `##VITE_API_URL= 'https://backend.caofa.com.py:4001/api/'\n##VITE_API_URL= 'https://node.sofmar.com.py:5026/api/'\n##VITE_API_URL= 'https://node.sofmar.com.py:5027/api/'\n##VITE_API_URL= 'https://node.sofmar.com.py:5031/api/'\n##VITE_API_URL= 'https://localhost:4024/api/'\nVITE_API_URL= '${config.api_url_secondary}'\n`;
    }

    // Buscar y reemplazar VITE_API_URL (la línea activa sin ##)
    if (envDevContent.includes('VITE_API_URL= ')) {
      envDevContent = envDevContent.replace(
        /^VITE_API_URL= '[^']*'/m,
        `VITE_API_URL= '${config.api_url_secondary}'`
      );
    } else {
      // Si no hay una línea activa, agregar al final
      envDevContent += `VITE_API_URL= '${config.api_url_secondary}'\n`;
    }

    fs.writeFileSync(envDevPath, envDevContent, "utf8");

    // Actualizar expres_api_url.ts
    let expresApiUrlContent = fs.readFileSync(expresApiUrlPath, "utf8");
    expresApiUrlContent = expresApiUrlContent.replace(
      /export const\s+api_url\s*=\s*"[^"]*"/,
      `export const api_url = "${config.api_url_secondary}"`
    );
    fs.writeFileSync(expresApiUrlPath, expresApiUrlContent, "utf8");

    // Actualizar index.html
    let indexContent = fs.readFileSync(indexPath, "utf8");
    indexContent = indexContent.replace(
      /<title>.*?<\/title>/,
      `<title>${config.title} - Sofmar Sistema - Tu aliado comercial</title>`
    );
    fs.writeFileSync(indexPath, indexContent, "utf8");

    console.log(`✅ Configuración actualizada exitosamente para ${empresa}`);
    console.log("Valores actualizados:");
    console.log(`- API URL: ${config.api_url}`);
    console.log(`- API URL Secondary: ${config.api_url_secondary}`);
    console.log(`- DB: ${config.db}`);
    console.log(`- Versión: ${config.version}`);
    console.log(`- Fecha Release: ${currentDate}`);
    console.log(`- Título: ${config.title}`);
    console.log(`- Expres API URL: ${config.api_url}`);
    console.log(`- Dotnet API URL: ${config.api_url_secondary}`);
    console.log(`- .env.development VITE_API_URL: ${config.api_url_secondary}`);

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
