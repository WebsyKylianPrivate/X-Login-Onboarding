/**
 * Exemple de fonction utilitaire
 * 
 * Import depuis n'importe où avec :
 * import { formatDate } from '@utils/example'
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR');
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

