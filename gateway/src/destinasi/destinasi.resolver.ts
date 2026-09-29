import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Destinasi, Fasilitas, Ulasan } from '@wisataku/domain';
import { DestinasiClient } from '../clients/destinasi.client';

const JUMLAH_ULASAN_TERBARU = 3;

/** Skema GraphQL sama dengan monolit; datanya kini diambil dari service-destinasi via TCP. */
@Resolver(() => Destinasi)
export class DestinasiResolver {
  constructor(private readonly destinasiClient: DestinasiClient) {}

  @Query(() => Destinasi, { name: 'destinasi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.destinasiClient.findOne(id);
  }

  @Query(() => [Destinasi], { name: 'cariDestinasi' })
  findAll(@Args('kategori', { nullable: true }) kategori?: string) {
    return this.destinasiClient.findAll({ kategori });
  }

  @ResolveField('ulasan', () => [Ulasan])
  getUlasan(@Parent() destinasi: Destinasi) {
    return this.destinasiClient.findUlasan(destinasi.id, JUMLAH_ULASAN_TERBARU);
  }

  @ResolveField('fasilitas', () => [Fasilitas])
  getFasilitas(@Parent() destinasi: Destinasi) {
    return this.destinasiClient.findFasilitas(destinasi.id);
  }
}
