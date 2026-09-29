import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  Destinasi,
  DestinasiService,
  Fasilitas,
  FasilitasService,
  Ulasan,
  UlasanService,
} from '@wisataku/domain';

const JUMLAH_ULASAN_TERBARU = 3;

@Resolver(() => Destinasi)
export class DestinasiResolver {
  constructor(
    private readonly destinasiService: DestinasiService,
    private readonly ulasanService: UlasanService,
    private readonly fasilitasService: FasilitasService,
  ) {}

  @Query(() => Destinasi, { name: 'destinasi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.destinasiService.findOne(id);
  }

  @Query(() => [Destinasi], { name: 'cariDestinasi' })
  findAll(@Args('kategori', { nullable: true }) kategori?: string) {
    return this.destinasiService.findAll({ kategori });
  }

  // Field bertingkat: hanya dieksekusi jika client meminta field "ulasan"
  @ResolveField('ulasan', () => [Ulasan])
  getUlasan(@Parent() destinasi: Destinasi) {
    return this.ulasanService.findByDestinasi(destinasi.id, JUMLAH_ULASAN_TERBARU);
  }

  @ResolveField('fasilitas', () => [Fasilitas])
  getFasilitas(@Parent() destinasi: Destinasi) {
    return this.fasilitasService.findByDestinasi(destinasi.id);
  }
}
