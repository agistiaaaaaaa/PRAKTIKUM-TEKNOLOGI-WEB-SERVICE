import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { Role } from './role.enum';

describe('JwtStrategy', () => {
  it('memetakan payload { sub, role } menjadi request.user', () => {
    const strategy = new JwtStrategy(new ConfigService({ JWT_SECRET: 'unit-test-secret' }));

    expect(strategy.validate({ sub: 5, role: Role.Wisatawan })).toEqual({
      userId: 5,
      role: 'wisatawan',
    });
  });

  it('gagal dibuat jika JWT_SECRET tidak diisi', () => {
    expect(() => new JwtStrategy(new ConfigService({}))).toThrow();
  });
});
