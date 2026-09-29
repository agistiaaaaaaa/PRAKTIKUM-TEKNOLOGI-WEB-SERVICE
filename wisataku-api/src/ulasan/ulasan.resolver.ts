import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser, GqlAuthGuard, Role, Roles, RolesGuard } from '@wisataku/auth';
import { CreateUlasanInput, Ulasan, UlasanService } from '@wisataku/domain';

@Resolver(() => Ulasan)
export class UlasanResolver {
  constructor(private readonly ulasanService: UlasanService) {}

  @Mutation(() => Ulasan, { name: 'tambahUlasan' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Wisatawan)
  tambahUlasan(@Args('input') input: CreateUlasanInput, @CurrentUser() user: AuthUser) {
    return this.ulasanService.create(user.userId, input);
  }
}
