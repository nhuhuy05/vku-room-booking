// ─── Room Image Assets ────────────────────────────────────────────
// Static require() calls for React Native bundler
// ─────────────────────────────────────────────────────────────────

export const RoomImages = {
  classroom: require('../assets/room_classroom.jpg'),
  lab:       require('../assets/room_lab.jpg'),
  seminar:   require('../assets/room_seminar.jpg'),
  hall:      require('../assets/room_hall.jpg'),
} as const;

/**
 * Pick the right image for a room.
 * B201 (hội trường) gets the hall image; all others use type-based image.
 */
export function getRoomImage(roomId: string, type: 'classroom' | 'lab' | 'seminar') {
  if (roomId === 'B201') return RoomImages.hall;
  return RoomImages[type];
}
