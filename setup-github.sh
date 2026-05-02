#!/usr/bin/env bash
# ============================================================
# Setup automático de El Parche Mundialista en GitHub
# ============================================================
# Uso:
#   1. Descomprime el ZIP de El Parche Mundialista
#   2. Coloca este script DENTRO de la carpeta del proyecto
#      (al mismo nivel que el README.md)
#   3. Ejecuta: bash setup-github.sh
# ============================================================

set -e  # Detener si algo falla

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   🏆  El Parche Mundialista — Setup de GitHub          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# 1. Verificar dependencias
# ============================================================

echo -e "${BLUE}🔍 Verificando dependencias...${NC}"

# Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado.${NC}"
    echo "   Instálalo desde: https://git-scm.com/downloads"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git instalado"

# GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI no está instalado.${NC}"
    echo "   Voy a intentar instalarlo automáticamente..."

    OS="$(uname -s)"
    if [[ "$OS" == "Darwin" ]]; then
        if command -v brew &> /dev/null; then
            brew install gh
        else
            echo -e "${RED}Necesitas Homebrew. Instálalo desde https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OS" == "Linux" ]]; then
        if command -v apt &> /dev/null; then
            (type -p wget >/dev/null || sudo apt install wget -y)
            sudo mkdir -p -m 755 /etc/apt/keyrings
            wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
            sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
        else
            echo -e "${RED}Instala gh manualmente: https://cli.github.com${NC}"
            exit 1
        fi
    else
        echo -e "${RED}SO no soportado para auto-install. Instala gh desde https://cli.github.com${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓${NC} GitHub CLI instalado"

# ============================================================
# 2. Login en GitHub (si no está autenticado)
# ============================================================

echo ""
echo -e "${BLUE}🔐 Verificando autenticación con GitHub...${NC}"

if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}No estás autenticado. Iniciando login...${NC}"
    echo "   Selecciona: GitHub.com → HTTPS → Login with a web browser"
    gh auth login
fi
echo -e "${GREEN}✓${NC} Autenticado en GitHub"

# ============================================================
# 3. Verificar que estamos en la carpeta del proyecto
# ============================================================

if [ ! -f "README.md" ] || [ ! -d "supabase" ]; then
    echo -e "${RED}❌ Este script debe ejecutarse dentro de la carpeta del proyecto.${NC}"
    echo "   Verifica que estés en 'el-parche-mundialista/' (donde está el README.md)"
    exit 1
fi

# ============================================================
# 4. Inicializar git
# ============================================================

echo ""
echo -e "${BLUE}📦 Inicializando repositorio local...${NC}"

if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un repositorio git aquí. Saltando init.${NC}"
else
    git init -b main
    echo -e "${GREEN}✓${NC} Git inicializado en branch 'main'"
fi

# ============================================================
# 5. Copiar archivos extra de GitHub
# ============================================================

echo ""
echo -e "${BLUE}📄 Copiando plantillas de GitHub...${NC}"

# Si hay archivos .github/ en la misma carpeta del script, los copiamos
if [ -d ".github" ]; then
    echo -e "${GREEN}✓${NC} Carpeta .github/ ya presente"
fi

# ============================================================
# 6. Primer commit
# ============================================================

echo ""
echo -e "${BLUE}📝 Creando primer commit...${NC}"

git add .
git commit -m "feat: initial commit — documentación, schema y plantillas de GitHub

- README, reglamento, arquitectura, decisiones técnicas (ADRs)
- Schema SQL completo para Supabase con RLS
- Plantillas de GitHub: PR, issues, CI workflow
- LICENSE MIT
- .gitignore y .env.example" || echo -e "${YELLOW}⚠️  Sin cambios para commitear${NC}"

# ============================================================
# 7. Crear repo público en GitHub
# ============================================================

echo ""
echo -e "${BLUE}🚀 Creando repo en GitHub...${NC}"
echo ""
read -p "Nombre del repo [el-parche-mundialista]: " REPO_NAME
REPO_NAME=${REPO_NAME:-el-parche-mundialista}

read -p "Descripción del repo [La polla del Mundial 2026 entre amigos y colegas]: " REPO_DESC
REPO_DESC=${REPO_DESC:-"⚽🏆 La polla del Mundial 2026 para vivir cada partido con el parche y los colegas."}

# Crear repo público y push
gh repo create "$REPO_NAME" \
    --public \
    --description "$REPO_DESC" \
    --source=. \
    --remote=origin \
    --push

# ============================================================
# 8. Configurar topics (etiquetas) del repo
# ============================================================

echo ""
echo -e "${BLUE}🏷️  Agregando topics al repo...${NC}"

gh repo edit --add-topic worldcup --add-topic worldcup-2026 --add-topic football --add-topic polla --add-topic quiniela --add-topic nextjs --add-topic supabase --add-topic typescript --add-topic colombia --add-topic pwa

echo -e "${GREEN}✓${NC} Topics agregados"

# ============================================================
# 9. Resumen final
# ============================================================

REPO_URL=$(gh repo view --json url -q .url)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅  Repo creado exitosamente                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🔗 URL del repo: ${BLUE}$REPO_URL${NC}"
echo ""
echo -e "${YELLOW}📌 Próximos pasos sugeridos:${NC}"
echo "   1. Visita el repo y verifica que todo subió bien"
echo "   2. Configura branch protection en main (Settings → Branches)"
echo "   3. Habilita GitHub Issues y Discussions si quieres"
echo "   4. Conecta el repo a Vercel para deploy automático"
echo "   5. Agrega el link del repo a tu Notion (página principal)"
echo ""
echo -e "${GREEN}¡Listo! Buena polla, parcero. ⚽🇨🇴${NC}"
