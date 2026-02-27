class VorldSpaceSystem {

  constructor() {

    this.bounds = {
      minX: -1000,
      maxX: 1000,
      minY: 0,
      maxY: 500,
      minZ: -1000,
      maxZ: 1000
    };

    this.creations = new Map();
  }

  // -------------------------
  // BOUND CHECK
  // -------------------------

  isInside(x, y, z) {
    return (
      x >= this.bounds.minX &&
      x <= this.bounds.maxX &&
      y >= this.bounds.minY &&
      y <= this.bounds.maxY &&
      z >= this.bounds.minZ &&
      z <= this.bounds.maxZ
    );
  }

  // -------------------------
  // REGISTER
  // -------------------------

  registerCreation(id, position, data = {}) {

    if (!this.isInside(position.x, position.y, position.z)) {
      throw new Error("Position outside Vorld bounds");
    }

    this.creations.set(id, {
      id,
      position: { ...position },
      data
    });
  }

  // -------------------------
  // UPDATE POSITION
  // -------------------------

  updateCreationPosition(id, newPosition) {

    const creation = this.creations.get(id);
    if (!creation) return;

    if (!this.isInside(newPosition.x, newPosition.y, newPosition.z)) return;

    creation.position = { ...newPosition };
  }

  // -------------------------
  // EXACT SEARCH
  // -------------------------

  getById(id) {
    return this.creations.get(id) || null;
  }

  // -------------------------
  // SEARCH BY COORDINATE
  // -------------------------

  getAt(x, y, z) {
    for (let creation of this.creations.values()) {
      if (
        Math.floor(creation.position.x) === Math.floor(x) &&
        Math.floor(creation.position.y) === Math.floor(y) &&
        Math.floor(creation.position.z) === Math.floor(z)
      ) {
        return creation;
      }
    }
    return null;
  }

  // -------------------------
  // RADIUS SEARCH
  // -------------------------

  searchNearby(position, radius) {

    const results = [];

    for (let creation of this.creations.values()) {

      const dx = creation.position.x - position.x;
      const dy = creation.position.y - position.y;
      const dz = creation.position.z - position.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= radius) {
        results.push(creation);
      }
    }

    return results;
  }

}

export const VorldSpace = new VorldSpaceSystem();