// src/app/shared/mask-cpf-cnpj.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCpfCnpj',
  standalone: true
})
export class MaskCpfCnpjPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) {
      // Formato CPF: 000.000.000-00
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (digits.length === 14) {
      // Formato CNPJ: 00.000.000/0000-00
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Se não for CPF nem CNPJ, retorna como está (ou formatado parcialmente)
    return digits;
  }
}