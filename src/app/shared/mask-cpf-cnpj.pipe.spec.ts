import { MaskCpfCnpjPipe } from './mask-cpf-cnpj.pipe';

describe('MaskCpfCnpjPipe', () => {
  it('create an instance', () => {
    const pipe = new MaskCpfCnpjPipe();
    expect(pipe).toBeTruthy();
  });
});
