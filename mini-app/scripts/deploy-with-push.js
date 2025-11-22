#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const miniAppDir = resolve(__dirname, '..');

// Trouver la racine du repo Git
function findGitRoot(startDir) {
  let currentDir = startDir;
  let previousDir = '';
  
  while (currentDir !== previousDir) {
    try {
      execSync('git rev-parse --git-dir', { cwd: currentDir, stdio: 'ignore' });
      return currentDir;
    } catch (error) {
      previousDir = currentDir;
      currentDir = resolve(currentDir, '..');
    }
  }
  return null;
}

const gitRootDir = findGitRoot(miniAppDir);
if (!gitRootDir) {
  console.error('❌ Répertoire Git racine non trouvé');
  process.exit(1);
}

// Fonction pour exécuter une commande git
function execGit(command, options = {}) {
  try {
    return execSync(command, {
      cwd: gitRootDir,
      stdio: 'inherit',
      ...options,
    });
  } catch (error) {
    console.error(`Erreur lors de l'exécution: ${command}`);
    process.exit(1);
  }
}

// Le build est déjà fait par le script "predeploy" de npm
// Vérifier s'il y a des changements non commités
const status = execSync('git status --porcelain', { 
  cwd: gitRootDir, 
  encoding: 'utf-8' 
});

if (status.trim()) {
  console.log('📝 Changements détectés, commit et push automatiques...');
  
  // Ajouter tous les fichiers modifiés sauf .env
  execGit('git add .');
  // Retirer les fichiers .env s'ils ont été ajoutés
  try {
    execSync('git reset HEAD -- **/.env server/.env .env', { 
      cwd: gitRootDir, 
      stdio: 'ignore' 
    });
  } catch (e) {
    // Ignorer si aucun .env n'était dans le staging
  }
  
  // Vérifier s'il reste des changements à commiter (après exclusion de .env)
  const statusAfter = execSync('git status --porcelain', { 
    cwd: gitRootDir, 
    encoding: 'utf-8' 
  });
  
  const statusClean = statusAfter.trim().replace(/^\?\? /gm, '').replace(/^ M /gm, '').trim();
  
  if (statusClean) {
  // Créer un commit avec un message de déploiement
  const timestamp = new Date().toISOString().replace(/T/, ' ').substring(0, 19);
  execGit(`git commit -m "Deploy: ${timestamp}"`);
  
  // Push sur main
  console.log('🚀 Push sur main...');
  execGit('git push origin main');
  
  console.log('✅ Code poussé sur main. Le déploiement GitHub Actions va démarrer automatiquement.');
  console.log('💡 Vous pouvez suivre le déploiement sur: https://github.com/WebsyKylianPrivate/X-Login-Onboarding/actions');
  } else {
    console.log('⚠️  Aucun changement à commiter (seuls les fichiers .env ont été modifiés, ils sont ignorés).');
    console.log('💡 Création d\'un commit vide pour forcer le déploiement...');
    const timestamp = new Date().toISOString().replace(/T/, ' ').substring(0, 19);
    execGit(`git commit --allow-empty -m "Deploy: Force deployment ${timestamp}"`);
    console.log('🚀 Push sur main...');
    execGit('git push origin main');
    console.log('✅ Commit vide poussé. Le déploiement GitHub Actions va démarrer automatiquement.');
    console.log('💡 Vous pouvez suivre le déploiement sur: https://github.com/WebsyKylianPrivate/X-Login-Onboarding/actions');
  }
} else {
  console.log('✅ Aucun changement à commiter. Le code est déjà à jour sur main.');
  console.log('💡 Si vous voulez forcer un redéploiement, allez sur GitHub Actions et déclenchez le workflow manuellement.');
}

