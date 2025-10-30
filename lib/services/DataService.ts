import bnccData from '@/lib/data/bncc-data.json';
import type { DataHierarchy } from '@/lib/types';

export class DataService {
  private hierarchy: DataHierarchy;

  constructor() {
    this.hierarchy = bnccData as DataHierarchy;
    
    if (!this.hierarchy || Object.keys(this.hierarchy).length === 0) {
      throw new Error('BNCC data could not be loaded or is empty');
    }
  }

  getDisciplinas(): string[] {
    try {
      return Object.keys(this.hierarchy).sort();
    } catch (error) {
      console.error('Error getting disciplinas:', error);
      return [];
    }
  }

  getAnosByDisciplina(disciplina: string): string[] {
    try {
      if (!disciplina || !this.hierarchy[disciplina]) {
        throw new Error(`Invalid disciplina: ${disciplina}`);
      }

      return Object.keys(this.hierarchy[disciplina]).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numA - numB;
      });
    } catch (error) {
      console.error('Error getting anos by disciplina:', error);
      return [];
    }
  }

  getUnidadesByDisciplinaAno(disciplina: string, ano: string): string[] {
    try {
      if (!disciplina || !ano) {
        throw new Error('Disciplina and ano are required');
      }

      if (!this.hierarchy[disciplina]) {
        throw new Error(`Invalid disciplina: ${disciplina}`);
      }

      if (!this.hierarchy[disciplina][ano]) {
        throw new Error(`Invalid ano: ${ano} for disciplina: ${disciplina}`);
      }

      return Object.keys(this.hierarchy[disciplina][ano]).sort();
    } catch (error) {
      console.error('Error getting unidades:', error);
      return [];
    }
  }

  getObjetosByUnidade(disciplina: string, ano: string, unidade: string): string[] {
    try {
      if (!disciplina || !ano || !unidade) {
        throw new Error('Disciplina, ano, and unidade are required');
      }

      if (!this.hierarchy[disciplina]) {
        throw new Error(`Invalid disciplina: ${disciplina}`);
      }

      if (!this.hierarchy[disciplina][ano]) {
        throw new Error(`Invalid ano: ${ano} for disciplina: ${disciplina}`);
      }

      if (!this.hierarchy[disciplina][ano][unidade]) {
        throw new Error(`Invalid unidade: ${unidade}`);
      }

      return Object.keys(this.hierarchy[disciplina][ano][unidade]).sort();
    } catch (error) {
      console.error('Error getting objetos:', error);
      return [];
    }
  }

  getHabilidadesByObjeto(
    disciplina: string,
    ano: string,
    unidade: string,
    objeto: string
  ): string[] {
    try {
      if (!disciplina || !ano || !unidade || !objeto) {
        throw new Error('All parameters are required');
      }

      if (!this.hierarchy[disciplina]) {
        throw new Error(`Invalid disciplina: ${disciplina}`);
      }

      if (!this.hierarchy[disciplina][ano]) {
        throw new Error(`Invalid ano: ${ano} for disciplina: ${disciplina}`);
      }

      if (!this.hierarchy[disciplina][ano][unidade]) {
        throw new Error(`Invalid unidade: ${unidade}`);
      }

      if (!this.hierarchy[disciplina][ano][unidade][objeto]) {
        throw new Error(`Invalid objeto: ${objeto}`);
      }

      return this.hierarchy[disciplina][ano][unidade][objeto];
    } catch (error) {
      console.error('Error getting habilidades:', error);
      return [];
    }
  }

  validatePath(
    disciplina: string,
    ano?: string,
    unidade?: string,
    objeto?: string
  ): boolean {
    try {
      if (!this.hierarchy[disciplina]) return false;
      if (ano && !this.hierarchy[disciplina][ano]) return false;
      if (ano && unidade && !this.hierarchy[disciplina][ano][unidade]) return false;
      if (ano && unidade && objeto && !this.hierarchy[disciplina][ano][unidade][objeto]) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const dataService = new DataService();
