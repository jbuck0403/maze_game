class Combat {
  constructor(room) {
    this.room = room;
  }
  combatIDs = { projectile: "projectile" };
  // attacks are from arrow keys - will attack in the direction of the arrow key (not wasd)
  fireProjectile(playerNum) {
    //spawn a projectile in the direction pressed from one block away from the spawning entity
    //have that projectile move 2x faster than character move speed
    //when the projectile hits something that isn't empty space
    //  if a character was hit
    //    deal 1 damage to the character
    //  remove the projectile
  }
  moveProjectile(playerNum) {}
}
