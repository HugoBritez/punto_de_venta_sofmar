# 📋 **PLAN DE ACCIÓN COMPLETO: Servidor de Archivos Estáticos**

## 🎯 **OBJETIVO**
Crear un microservicio de archivos estáticos que funcione como Google Drive con API REST, usando Docker + nginx + Go, integrado con la infraestructura multi-cliente existente.

---

## 🏗️ **ARQUITECTURA FINAL**

```
Cliente React → nginx:4040 → {
  /static/* → nginx (archivos estáticos)
  /api/*    → Go API:3000 (gestión)
}
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
file-server-sofmar/
├── docker-compose.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/ (certificados)
├── api/
│   ├── main.go
│   ├── go.mod
│   ├── handlers/
│   │   ├── upload.go
│   │   ├── download.go
│   │   ├── list.go
│   │   └── delete.go
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── auth.go
│   │   └── client.go
│   ├── config/
│   │   ├── config.go
│   │   └── clients.go
│   ├── models/
│   │   └── file.go
│   └── Dockerfile
├── uploads/ (volumen Docker)
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── setup.sh
└── frontend-integration/
    └── FileService.ts
```

---

## 🔢 **FASES DE IMPLEMENTACIÓN**

### **FASE 1: Setup Básico (Día 1)**

#### 1.1 Crear estructura del proyecto
```bash
mkdir file-server-sofmar
cd file-server-sofmar
mkdir -p {api/{handlers,middleware,config,models},nginx,uploads,scripts,frontend-integration}
```

#### 1.2 Inicializar Go API
```bash
cd api
go mod init file-server-sofmar
go get github.com/gorilla/mux
go get github.com/gorilla/handlers
go get github.com/google/uuid
```

#### 1.3 Docker Compose base
- Configurar servicios nginx + go-api
- Configurar volúmenes compartidos
- Configurar redes internas

### **FASE 2: API Core (Día 1-2)**

#### 2.1 Implementar handlers principales
- `upload.go`: Subida de archivos con validación
- `download.go`: Descarga y streaming de archivos
- `list.go`: Listado de archivos por cliente
- `delete.go`: Eliminación segura de archivos

#### 2.2 Sistema de configuración multi-cliente
```go
// Basado en tu scripts/updateConfig.js
var ClientConfigs = map[string]ClientConfig{
    "acricolor": {...},
    "lobeck": {...},
    // ... todos tus clientes
}
```

#### 2.3 Middleware esencial
- CORS para tu frontend
- Autenticación (JWT compatible con tu sistema)
- Validación de tipos de archivo
- Límites de tamaño por cliente

### **FASE 3: nginx Optimizado (Día 2)**

#### 3.1 Configuración nginx
- Servir archivos estáticos ultra-rápido
- Proxy API requests al Go backend
- Compresión gzip
- Headers de cache optimizados
- SSL/TLS configuration

#### 3.2 Seguridad
- Rate limiting
- Validación de tipos MIME
- Headers de seguridad
- CORS policy

### **FASE 4: Integración Frontend (Día 2-3)**

#### 4.1 Crear FileService.ts
```typescript
export class FileService {
  private baseUrl = 'https://node.sofmar.com.py:4040';
  
  async uploadFile(file: File, client: string): Promise<FileResponse>
  async downloadFile(fileId: string): Promise<Blob>
  async listFiles(client: string): Promise<FileMetadata[]>
  async deleteFile(fileId: string): Promise<void>
}
```

#### 4.2 Hooks React para archivos
```typescript
export const useFileUpload = (client: string) => { }
export const useFileList = (client: string) => { }
```

#### 4.3 Componentes UI
- `FileUploadDropzone.tsx`
- `FileList.tsx`
- `FilePreview.tsx`

### **FASE 5: Sistema Multi-Cliente (Día 3)**

#### 5.1 Configuración por cliente
- Límites de tamaño específicos
- Tipos de archivo permitidos
- Estructura de directorios
- Permisos y accesos

#### 5.2 Integración con tu sistema de configs
- Usar la misma lógica que `scripts/updateConfig.js`
- Variables de entorno por cliente
- Build scripts específicos

### **FASE 6: Deploy y Infraestructura (Día 3-4)**

#### 6.1 Scripts de deploy
```bash
#!/bin/bash
# deploy.sh
docker-compose down
docker-compose pull
docker-compose up -d
docker-compose logs -f
```

#### 6.2 Configuración en tu servidor
- Puerto 4040 para el file server
- SSL certificates
- Firewall rules
- Backup automático

#### 6.3 Integración con tu CI/CD
- Añadir al workflow de GitHub Actions
- Deploy automático por cliente
- Health checks

### **FASE 7: Features Avanzadas (Día 4-5)**

#### 7.1 Metadata y búsqueda
- Base de datos para metadatos (opcional)
- Búsqueda por nombre/tipo
- Tags y categorías

#### 7.2 Optimizaciones
- Thumbnail generation para imágenes
- Compresión automática
- CDN integration (opcional)

#### 7.3 Monitoreo
- Logs estructurados
- Métricas de uso
- Health checks
- Alertas

---

## 🛠️ **ESPECIFICACIONES TÉCNICAS**

### **API Endpoints**
```
POST   /api/files/upload
GET    /api/files/download/:fileId
GET    /api/files/list/:client
DELETE /api/files/:fileId
GET    /api/files/metadata/:fileId
POST   /api/files/search/:client
GET    /static/:client/:filename
```

### **Configuración por Cliente**
```go
type ClientConfig struct {
    MaxFileSize        int64
    AllowedTypes       []string
    StoragePath        string
    RequiresAuth       bool
    CompressionEnabled bool
}
```

### **Estructura de Respuesta**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "filename": "document.pdf",
    "client": "acricolor",
    "size": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "url": "/static/acricolor/uuid-document.pdf"
  }
}
```

### **Variables de Entorno**
```bash
# docker-compose.yml
environment:
  - GO_ENV=production
  - MAX_FILE_SIZE=100MB
  - ALLOWED_ORIGINS=https://*.sofmar.com.py,https://*.gaesa.com.py
  - JWT_SECRET=${JWT_SECRET}
  - DEFAULT_CLIENT=shared
```

### **Configuración Multi-Cliente**
```go
// config/clients.go - Basado en tu scripts/updateConfig.js
var ClientConfigs = map[string]ClientConfig{
    "acricolor": {
        MaxFileSize: 50 * 1024 * 1024, // 50MB
        AllowedTypes: []string{"image/*", "application/pdf", "text/*"},
        StoragePath: "uploads/acricolor",
        RequiresAuth: true,
    },
    "lobeck": {
        MaxFileSize: 100 * 1024 * 1024, // 100MB
        AllowedTypes: []string{"*/*"},
        StoragePath: "uploads/lobeck",
        RequiresAuth: true,
    },
    "gaesa": {
        MaxFileSize: 200 * 1024 * 1024, // 200MB
        AllowedTypes: []string{"*/*"},
        StoragePath: "uploads/gaesa",
        RequiresAuth: true,
    },
    // ... resto de tus clientes existentes
    "shared": {
        MaxFileSize: 10 * 1024 * 1024, // 10MB
        AllowedTypes: []string{"image/*", "application/pdf"},
        StoragePath: "uploads/shared",
        RequiresAuth: false,
    },
}
```

---

## 🚀 **COMANDOS DE SETUP RÁPIDO**

### **1. Crear proyecto**
```bash
mkdir file-server-sofmar && cd file-server-sofmar
```

### **2. Clonar estructura**
```bash
# Estructura completa que te voy a proporcionar
git clone <repo-template> # O crear manualmente
```

### **3. Configurar variables**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### **4. Deploy inicial**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
docker-compose up -d
```

### **5. Verificar funcionamiento**
```bash
curl http://localhost:4040/health
curl http://localhost:4040/api/files/list/shared
```

### **6. Integrar en frontend**
```bash
# Copiar FileService.ts a tu proyecto React
cp frontend-integration/FileService.ts ../punto_de_venta_sofmar/src/services/
```

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Performance**
- [ ] Upload de 100MB en <30 segundos
- [ ] Download de archivos en <5 segundos
- [ ] Manejo de 1000+ archivos simultáneos
- [ ] Uso de memoria <100MB
- [ ] Tiempo de respuesta API <200ms

### **Funcionalidad**
- [ ] Upload/download para todos los clientes
- [ ] Integración con frontend React
- [ ] Autenticación compatible con tu sistema
- [ ] Backup automático
- [ ] Listado y búsqueda de archivos

### **Infraestructura**
- [ ] Deploy en tu servidor existente (node.sofmar.com.py:4040)
- [ ] SSL/HTTPS configurado
- [ ] Logs y monitoreo
- [ ] Escalabilidad horizontal
- [ ] Integración con GitHub Actions

### **Seguridad**
- [ ] Validación de tipos de archivo
- [ ] Rate limiting configurado
- [ ] Headers de seguridad
- [ ] Autenticación JWT
- [ ] CORS configurado correctamente

---

## 🔧 **CONFIGURACIÓN DE SERVIDOR**

### **Requisitos mínimos**
- Docker y Docker Compose instalados
- Puerto 4040 disponible
- Espacio en disco para archivos (mínimo 10GB)
- Certificados SSL para HTTPS

### **Estructura de directorios en servidor**
```bash
/opt/file-server-sofmar/
├── docker-compose.yml
├── .env
├── nginx/
├── uploads/
│   ├── acricolor/
│   ├── lobeck/
│   ├── gaesa/
│   └── shared/
└── backups/
```

### **Comando de backup automático**
```bash
# scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /opt/backups/files_backup_$DATE.tar.gz /opt/file-server-sofmar/uploads/
# Mantener solo últimos 7 backups
find /opt/backups/ -name "files_backup_*.tar.gz" -mtime +7 -delete
```

---

## 🎯 **PRÓXIMOS PASOS INMEDIATOS**

### **Prioridad Alta (Esta semana)**
1. **Crear la estructura del proyecto completa**
2. **Implementar el Go API básico**
3. **Configurar Docker Compose**
4. **Crear nginx.conf optimizado**
5. **Implementar FileService.ts para React**

### **Prioridad Media (Próxima semana)**
6. **Configurar SSL y dominio**
7. **Integrar con sistema de autenticación existente**
8. **Crear componentes React para UI**
9. **Configurar backup automático**
10. **Testing y optimización**

### **Prioridad Baja (Futuro)**
11. **Thumbnail generation**
12. **Compresión automática de imágenes**
13. **Sistema de búsqueda avanzada**
14. **Dashboard de administración**
15. **CDN integration**

---

## 📞 **CONTACTO Y SOPORTE**

- **Documentación API**: `/api/docs` (Swagger/OpenAPI)
- **Health Check**: `/health`
- **Logs**: `docker-compose logs -f`
- **Monitoreo**: Puerto interno para métricas

---

**¿Empezamos con la Fase 1?** El próximo paso es crear toda la estructura del proyecto e implementar el código base.