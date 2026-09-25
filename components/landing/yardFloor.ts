// Where to plant scenery at depth z (0 back .. 1 front) in the title page's
// yard (HeroPets), on wide screens: its CSS bottom offset -- the floor line
// at that depth -- and the zIndex that puts it between the dogs behind and
// in front of it. Mirrors HeroPets' measureStage (floorY = height - 14,
// depth 22) and yardSim's viewDog (zIndex = 10 + z * 40). Kept in its own
// module (not HeroPets, a client file) so the server-rendered Hero can call it.
export const yardFloor = (z: number) => ({ bottom: Math.round(14 + (1 - z) * 22), zIndex: 10 + Math.round(z * 40) });
